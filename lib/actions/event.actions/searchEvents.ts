'use server';

import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { FilterQuery } from "mongoose";

export async function searchEvents({ query, mode, date }: {
    query?: string;
    mode?: string;
    date?: string;
}) {
    await connectDB();

    const filter: FilterQuery<IEvent> = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { tags: { $in: [query] } }
        ];
    }

    if (mode) filter.mode = mode;
    if (date) filter.date = date;

    const events = await Event.find(filter)
        .select('title slug date location mode tags image')
        .limit(20)
        .lean();

    return events.map(e => ({
        ...e,
        _id: e._id.toString()
    }));
}