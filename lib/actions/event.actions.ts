'use server';

import Event, {IEventLean} from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEventLean[]> => {
    try {
        await connectDB();
        const event = await Event.findOne({slug});

        if (!event) {
            return [];
        }

        const similarEvents = await Event.find(
            {_id: {$ne: event._id}, tags: {$in: event.tags}}
        ).lean().exec();

        // Convert the lean results to IEventLean format
        return similarEvents.map(event => ({
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
            updatedAt: event.updatedAt
        } as IEventLean));
    } catch {
        return [];
    }
}

export const getAllEvents = async () => {
    try {
        await connectDB();
        return await Event.find().sort({createdAt: -1}).lean();
    } catch {
        return []
    }
}