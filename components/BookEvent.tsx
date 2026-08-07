'use client';

import {useState, FormEvent} from "react";
import {createBooking} from "@/lib/actions/booking.actions";

const BookEvent = ({eventId, slug}: { eventId: string, slug: string; }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const {success, error: message} = await createBooking({eventId, slug, email});

        if (success) {
            setSubmitted(true);
        } else {
            setError(message ?? 'Booking failed. Please try again.');
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm animate-[fadeInUp_300ms_ease-out]">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
