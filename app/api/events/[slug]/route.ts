import {NextRequest, NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, {IEvent} from '@/database/event.model';

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        // Await the params promise
        const params = await context.params;
        const {slug} = params;

        if (!slug) {
            return NextResponse.json(
                {
                    message: 'Invalid slug parameter',
                    error: 'Slug must be a non-empty string',
                },
                {status: 400}
            );
        }

        // Sanitize slug to prevent injection attacks
        const sanitizedSlug = slug.trim().toLowerCase();

        if (sanitizedSlug.length === 0) {
            return NextResponse.json(
                {
                    message: 'Invalid slug parameter',
                    error: 'Slug cannot be empty',
                },
                {status: 400}
            );
        }

        // Connect to database
        await connectDB();

        // Query events by slug
        const event = await Event.findOne({slug: sanitizedSlug}).lean<IEvent>();

        // Handle not found
        if (!event) {
            return NextResponse.json(
                {
                    message: 'Event not found',
                    error: `No event exists with slug: ${sanitizedSlug}`,
                },
                {status: 404}
            );
        }

        // Return successful response
        return NextResponse.json(
            {
                message: 'Event fetched successfully',
                event,
            },
            {status: 200}
        );
    } catch (error) {
        // Log error for debugging (in production, use proper logging service)
        console.error('Error fetching events by slug:', error);

        // Handle database connection errors
        if (error instanceof Error && error.message.includes('connect')) {
            return NextResponse.json(
                {
                    message: 'Database connection failed',
                    error: 'Unable to connect to the database',
                },
                {status: 503}
            );
        }

        // Handle unexpected errors
        return NextResponse.json(
            {
                message: 'Failed to fetch events',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            },
            {status: 500}
        );
    }
}

// TypeScript type for API response
type ApiResponse =
    | {
    message: string;
    event: IEvent;
}
    | {
    message: string;
    error: string;
};