'use server';

import connectDB from "@/lib/mongodb";
import Event, {IEvent} from "@/database/event.model";
import {FilterQuery} from "mongoose";

export interface SearchEventsInput {
    query?: string;
    mode?: string;
    date?: string;
}

export interface SearchEventResult {
    _id: string;
    title: string;
    slug: string;
    date: string;
    location: string;
    mode: string;
    tags: string[];
    image: string;
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchEvents({query, mode, date}: SearchEventsInput): Promise<SearchEventResult[]> {
    await connectDB();

    const filter: FilterQuery<IEvent> = {};

    if (query) {
        const escapedQuery = escapeRegex(query.trim());
        filter.$or = [
            {title: {$regex: escapedQuery, $options: 'i'}},
            {description: {$regex: escapedQuery, $options: 'i'}},
            {location: {$regex: escapedQuery, $options: 'i'}},
            {tags: query.trim()}
        ];
    }

    if (mode) filter.mode = mode;
    if (date) filter.date = date;

    const events = await Event.find(filter)
        .select('title slug date location mode tags image')
        .limit(20)
        .lean();

    return events.map(e => ({
        _id: e._id.toString(),
        title: e.title,
        slug: e.slug,
        date: e.date,
        location: e.location,
        mode: e.mode,
        tags: e.tags,
        image: e.image,
    }));
}