import Event, {IEventLean} from "@/lib/models/event.model";
import connectDB from "@/lib/mongodb";
import {escapeRegex} from "@/lib/utils";

/**
 * Event service — the single source of truth for event reads and writes.
 *
 * Every entry point calls these functions directly:
 * - Pages & server components (e.g. `app/create-event`, `app/events/[slug]`)
 * - REST API routes (`app/api/events/**`)
 *
 * This is a plain server-only module (no `'use server'` directive) because
 * nothing here is invoked directly from a client component — pages wrap these
 * calls in their own server actions when needed.
 *
 * Queries return lean documents; write functions return a tagged
 * `EventWriteResult` so each layer can map success/error to its own
 * transport (inline form state vs HTTP status code).
 */

// Shape accepted by toLeanEvent: a document or a lean() result (both expose
// the same fields, with _id being an ObjectId or string).
type EventLeanSource = {
    _id: {toString(): string} | string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Converts a Mongoose document / lean() result into the plain `IEventLean`
 * shape consumed by components. `_id` is stringified because lean() returns
 * an ObjectId, which is not serializable when passed to a client component.
 */
function toLeanEvent(event: EventLeanSource): IEventLean {
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

export const getEventBySlug = async (slug: string): Promise<IEventLean | null> => {
    await connectDB();
    const event = await Event.findOne({ slug })
        .select('title slug description overview image venue location date time mode audience agenda organizer tags createdBy createdAt updatedAt')
        .lean();

    if (!event) return null;

    return toLeanEvent(event);
};

export const getSimilarEventsBySlug = async (slug: string): Promise<IEventLean[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).select('tags').lean();
        if (!event) return [];

        // Aggregation: pick up to 4 random events (via $sample) that share at
        // least one tag with the current event, excluding the event itself.
        const similarEvents = await Event.aggregate([
            {$match: {_id: {$ne: event._id}, tags: {$in: event.tags}}},
            {$sample: {size: 4}},
            {$project: {title: 1, slug: 1, image: 1, location: 1, date: 1, time: 1, createdBy: 1, createdAt: 1, updatedAt: 1}},
        ]);

        // The $project stage only selects a few fields, so every other field is
        // padded with an empty placeholder to satisfy the full IEventLean type.
        // Consumers only read title/slug/image/location/date/time here.
        return similarEvents.map((e: Record<string, unknown>) => ({
            _id: (e._id as {toString(): string}).toString(),
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
    // Lazy-imported so read-heavy event queries don't pull the Booking model
    // into the module graph unless a booking count is actually needed.
    const { default: Booking } = await import('@/lib/models/booking.model');
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

export interface PaginatedEvents {
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

    const escapedQuery = escapeRegex(query.trim());
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

/**
 * Result of a write (create / update). `code` lets callers map failures to a
 * sensible transport response (e.g. HTTP 404/403/409 vs an inline form error).
 */
export type EventWriteResult =
    | { success: true; event: IEventLean }
    | { success: false; error: string; code?: 'NOT_FOUND' | 'FORBIDDEN' | 'DUPLICATE' | 'UNKNOWN' };

function isDuplicateKeyError(e: unknown): boolean {
    return typeof e === 'object' && e !== null && (e as { code?: number }).code === 11000;
}

export const createEvent = async (input: CreateEventInput): Promise<EventWriteResult> => {
    try {
        await connectDB();
        const event = await Event.create(input);
        return {success: true, event: toLeanEvent(event)};
    } catch (e) {
        // The slug has a unique index; a duplicate title surfaces as a Mongo
        // E11000 error. Map it to a friendly message + 409 instead of a raw 500.
        if (isDuplicateKeyError(e)) {
            return {success: false, code: 'DUPLICATE', error: 'An event with this title already exists'};
        }
        const message = e instanceof Error ? e.message : 'Failed to create event';
        return {success: false, error: message};
    }
};

export const updateEvent = async (
    slug: string,
    userId: string,
    input: Omit<UpdateEventInput, 'slug'>
): Promise<EventWriteResult> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug});

        if (!event) {
            return {success: false, code: 'NOT_FOUND', error: 'Event not found'};
        }

        if (event.createdBy !== userId) {
            return {success: false, code: 'FORBIDDEN', error: 'You are not authorized to edit this event'};
        }

        Object.assign(event, input);
        await event.save();

        return {success: true, event: toLeanEvent(event)};
    } catch (e) {
        // Same duplicate-slug handling as createEvent (renaming an event onto
        // an existing title hits the unique index → Mongo E11000).
        if (isDuplicateKeyError(e)) {
            return {success: false, code: 'DUPLICATE', error: 'An event with this title already exists'};
        }
        const message = e instanceof Error ? e.message : 'Failed to update event';
        return {success: false, error: message};
    }
};

export const getEventForEdit = async (slug: string, userId: string): Promise<EventWriteResult> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug}).lean();

        if (!event) {
            return {success: false, code: 'NOT_FOUND', error: 'Event not found'};
        }

        if (event.createdBy !== userId) {
            return {success: false, code: 'FORBIDDEN', error: 'You are not authorized to edit this event'};
        }

        return {
            success: true,
            event: toLeanEvent(event),
        };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to fetch event';
        return {success: false, error: message};
    }
};
