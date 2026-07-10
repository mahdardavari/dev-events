'use server';

import Event, {IEventLean} from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export const getEventBySlug = async (slug: string): Promise<IEventLean | null> => {
    await connectDB();
    const event = await Event.findOne({slug}).lean<Omit<IEventLean, '_id'> & { _id: { toString(): string } }>();

    if (!event) return null;

    return {
        _id: event._id.toString(),
        title: event.title,
        slug: event.slug,
        description: event.description,
        overview: event.overview,
        image: event.image,
        venue: event.venue,
        location: event.location,
        date: event.date,
        time: event.time,
        mode: event.mode,
        audience: event.audience,
        agenda: event.agenda,
        organizer: event.organizer,
        tags: event.tags,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
    };
};

export const getSimilarEventsBySlug = async (slug: string): Promise<IEventLean[]> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug}).select('tags').lean();

        if (!event) return [];

        const similarEvents = await Event.find(
            {_id: {$ne: event._id}, tags: {$in: event.tags}}
        ).lean();

        return similarEvents.map((e) => ({
            _id: e._id.toString(),
            title: e.title,
            slug: e.slug,
            description: e.description,
            overview: e.overview,
            image: e.image,
            venue: e.venue,
            location: e.location,
            date: e.date,
            time: e.time,
            mode: e.mode,
            audience: e.audience,
            agenda: e.agenda,
            organizer: e.organizer,
            tags: e.tags,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
        }));
    } catch {
        return [];
    }
};

export const getBookingCountByEventId = async (eventId: string): Promise<number> => {
    await connectDB();
    const { default: Booking } = await import('@/database/booking.model');
    return Booking.countDocuments({eventId});
};

export const getAllEvents = async () => {
    try {
        await connectDB();
        return await Event.find().sort({createdAt: -1}).lean();
    } catch {
        return [];
    }
};

export const getFilteredEvents = async (query: string) => {
    await connectDB();

    if (!query.trim()) {
        return Event.find().sort({createdAt: -1}).lean();
    }

    const regex = new RegExp(query.trim(), 'i');

    return Event.find({
        $or: [
            {title: regex},
            {description: regex},
            {location: regex},
            {tags: regex},
        ],
    })
        .sort({createdAt: -1})
        .lean();
};
