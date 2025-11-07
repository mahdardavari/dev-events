'use server';

import Event, {IEvent} from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({slug});

        // Handle null case - if event not found, return empty array
        if (!event) {
            return [];
        }

        return await Event.find({_id: {$ne: event._id}, tags: {$in: event.tags}}).lean();
    } catch {
        return [];
    }
}
