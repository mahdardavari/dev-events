'use server';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking, { IBooking } from "@/database/booking.model";
import { Types } from "mongoose";

export async function smartBooking({
    eventSlug,
    email,
    userName
}: {
    eventSlug: string;
    email: string;
    userName?: string;
}) {
    try {
        await connectDB();

        const event = await Event.findOne({ slug: eventSlug });
        if (!event) {
            return {
                success: false,
                message: "The requested event was not found",
                bookingId: null
            };
        }

        // Check for duplicate bookings
        const existingBooking = await Booking.findOne({
            eventId: event._id,
            email
        });

        if (existingBooking) {
            return {
                success: false,
                message: "You have already booked this event",
                bookingId: null
            };
        }

        // Create a new reservation
        const booking: IBooking = await Booking.create({
            eventId: event._id,
            email,
            userName
        });

        return {
            success: true,
            message: "Reservation completed successfully",
            bookingId: (booking._id as Types.ObjectId).toString()
        };
    } catch (error) {
        console.error('Smart booking error:', error);
        return {
            success: false,
            message: "Error making reservation",
            bookingId: null
        };
    }
}