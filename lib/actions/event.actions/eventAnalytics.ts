'use server';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";

export async function eventAnalytics({
    eventSlug,
    timeRange = 'month'
}: {
    eventSlug?: string;
    timeRange?: string;
}) {
    await connectDB();

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
    }

    // If a specific event is specified
    if (eventSlug) {
        const event = await Event.findOne({ slug: eventSlug });
        if (!event) {
            return {
                totalEvents: 0,
                totalBookings: 0,
                popularTags: [],
                upcomingEvents: []
            };
        }

        const bookings = await Booking.countDocuments({
            eventId: event._id,
            createdAt: { $gte: startDate }
        });

        return {
            totalEvents: 1,
            totalBookings: bookings,
            popularTags: event.tags,
            upcomingEvents: [{
                title: event.title,
                date: event.date,
                bookings: bookings
            }]
        };
    }

    // General statistics
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments({
        createdAt: { $gte: startDate }
    });

    // Find popular tags
    const tags = await Event.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Upcoming events
    const upcomingEvents = await Event.find({
        date: { $gte: new Date().toISOString().split('T')[0] }
    })
        .sort({ date: 1 })
        .limit(5)
        .select('title slug date bookings')
        .lean();

    return {
        totalEvents,
        totalBookings,
        popularTags: tags.map(t => ({ tag: t._id, count: t.count })),
        upcomingEvents: upcomingEvents.map(e => ({
            ...e,
            _id: e._id.toString()
        }))
    };
}