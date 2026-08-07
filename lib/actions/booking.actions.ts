'use server';

import Booking from '@/database/booking.model';

import connectDB from "@/lib/mongodb";

export const createBooking = async ({eventId, slug, email}: { eventId: string; slug: string; email: string; }) => {
    try {
        await connectDB();

        const existing = await Booking.findOne({eventId, email});
        if (existing) {
            return {success: false, error: 'You have already booked this event'};
        }

        await Booking.create({eventId, slug, email});

        return {success: true};
    } catch (e) {
        console.error('create booking failed', e);
        return {success: false, error: 'Booking failed. Please try again.'};
    }
}
