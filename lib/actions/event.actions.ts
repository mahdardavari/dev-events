'use server';

import Event, { IEventLean } from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export const getEventBySlug = async (slug: string): Promise<IEventLean | null> => {
    await connectDB();
    const event = await Event.findOne({ slug })
        .select('title slug description overview image venue location date time mode audience agenda organizer tags createdBy createdAt updatedAt')
        .lean();

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
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
    };
};

export const getSimilarEventsBySlug = async (slug: string): Promise<IEventLean[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).select('tags').lean();
        if (!event) return [];

        const similarEvents = await Event.aggregate([
            {$match: {_id: {$ne: event._id}, tags: {$in: event.tags}}},
            {$sample: {size: 4}},
            {$project: {title: 1, slug: 1, image: 1, location: 1, date: 1, time: 1, createdBy: 1, createdAt: 1, updatedAt: 1}},
        ]);

        return similarEvents.map((e: Record<string, unknown>) => ({
            _id: (e._id as {_toString(): string})._toString(),
            title: e.title as string,
            slug: e.slug as string,
            description: '',
            overview: '',
            image: e.image as string,
            venue: '',
            location: e.location as string,
            date: e.date as string,
            time: e.time as string,
            mode: '',
            audience: '',
            agenda: [],
            organizer: '',
            tags: [],
            createdBy: e.createdBy as string,
            createdAt: e.createdAt as Date,
            updatedAt: e.updatedAt as Date,
        }));
    } catch {
        return [];
    }
};

export const getBookingCountByEventId = async (eventId: string): Promise<number> => {
    await connectDB();
    const { default: Booking } = await import('@/database/booking.model');
    return Booking.countDocuments({ eventId });
};

export const getAllEvents = async () => {
    try {
        await connectDB();
        return await Event.find().sort({ createdAt: -1 }).lean();
    } catch {
        return [];
    }
};

interface PaginatedEvents {
    events: IEventLean[];
    total: number;
    hasMore: boolean;
}

export const getFilteredEvents = async (
    query: string,
    page: number = 1,
    limit: number = 12
): Promise<PaginatedEvents> => {
    await connectDB();
    const skip = (page - 1) * limit;

    if (!query.trim()) {
        const [events, total] = await Promise.all([
            Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Event.countDocuments(),
        ]);
        return {
            events: events.map((e) => ({ ...e, _id: e._id.toString() })),
            total,
            hasMore: skip + events.length < total,
        };
    }

    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const [events, total] = await Promise.all([
        Event.find({
            $or: [
                { title: regex },
                { description: regex },
                { location: regex },
                { tags: regex },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Event.countDocuments({
            $or: [
                { title: regex },
                { description: regex },
                { location: regex },
                { tags: regex },
            ],
        }),
    ]);

    return {
        events: events.map((e) => ({ ...e, _id: e._id.toString() })),
        total,
        hasMore: skip + events.length < total,
    };
};

export interface CreateEventInput {
    title: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdBy: string;
}

export interface UpdateEventInput extends Omit<CreateEventInput, 'createdBy'> {
    slug: string;
}

export interface EventActionResult {
    success: boolean;
    event?: IEventLean;
    error?: string;
}

function toLeanEvent(event: InstanceType<typeof Event>): IEventLean {
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
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
    };
}

export const createEvent = async (input: CreateEventInput): Promise<EventActionResult> => {
    try {
        await connectDB();
        const event = await Event.create(input);
        return {success: true, event: toLeanEvent(event)};
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to create event';
        return {success: false, error: message};
    }
};

export const updateEvent = async (
    slug: string,
    userId: string,
    input: Omit<UpdateEventInput, 'slug'>
): Promise<EventActionResult> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug});

        if (!event) {
            return {success: false, error: 'Event not found'};
        }

        if (event.createdBy !== userId) {
            return {success: false, error: 'You are not authorized to edit this event'};
        }

        Object.assign(event, input);
        await event.save();

        return {success: true, event: toLeanEvent(event)};
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to update event';
        return {success: false, error: message};
    }
};

export const getEventForEdit = async (slug: string, userId: string): Promise<EventActionResult> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug}).lean();

        if (!event) {
            return {success: false, error: 'Event not found'};
        }

        if (event.createdBy !== userId) {
            return {success: false, error: 'You are not authorized to edit this event'};
        }

        return {
            success: true,
            event: {
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
                createdBy: event.createdBy,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            },
        };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to fetch event';
        return {success: false, error: message};
    }
};
