import {NextRequest, NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, {IEvent, IEventLean} from '@/lib/models/event.model';
import {updateEvent} from '@/lib/services/event.service';
import {uploadEventImage} from '@/lib/cloudinary';
import {extractEventFormData} from '@/lib/event-form';

/**
 * REST API for a single event (GET / PUT) — external-consumer path.
 * GET queries the model directly; PUT delegates ownership + save to the
 * shared `updateEvent` in `lib/services/event.service.ts` (same code path as
 * the UI's server actions).
 *
 * ⚠️ SECURITY: the PUT handler authorizes via the client-supplied
 * `x-user-id` header, which anyone can spoof. Replace it with a real session
 * check (auth.api.getSession) before exposing this publicly.
 */

// GET returns the full lean document (IEvent); PUT returns the lean UI shape
// (IEventLean) via the shared service — both are valid `event` payloads.
type ApiResponse =
    | { message: string; event: IEvent | IEventLean }
    | { message: string; error: string };

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const {slug} = await context.params;

        if (!slug?.trim()) {
            return NextResponse.json(
                {message: 'Invalid slug parameter', error: 'Slug must be a non-empty string'},
                {status: 400}
            );
        }

        await connectDB();
        const event = await Event.findOne({slug: slug.trim().toLowerCase()}).lean<IEvent>();

        if (!event) {
            return NextResponse.json(
                {message: 'Event not found', error: `No event exists with slug: ${slug}`},
                {status: 404}
            );
        }

        return NextResponse.json({message: 'Event fetched successfully', event}, {status: 200});
    } catch (error) {
        console.error('Error fetching event by slug:', error);
        return NextResponse.json(
            {
                message: 'Failed to fetch event',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            },
            {status: 500}
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const {slug} = await context.params;
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                {message: 'Unauthorized', error: 'You must be logged in'},
                {status: 401}
            );
        }

        if (!slug?.trim()) {
            return NextResponse.json(
                {message: 'Invalid slug parameter', error: 'Slug must be a non-empty string'},
                {status: 400}
            );
        }

        await connectDB();
        const event = await Event.findOne({slug: slug.trim().toLowerCase()});

        if (!event) {
            return NextResponse.json(
                {message: 'Event not found', error: `No event exists with slug: ${slug}`},
                {status: 404}
            );
        }

        // Reject non-owners BEFORE parsing the body/uploading: the old code
        // ordered this check first, and it keeps an unauthorized caller from
        // triggering a paid Cloudinary upload. The service re-checks ownership
        // too (defense in depth).
        if (event.createdBy !== userId) {
            return NextResponse.json(
                {message: 'Forbidden', error: 'You can only edit your own events'},
                {status: 403}
            );
        }

        // Ownership + save are delegated to the shared service. We only fetch
        // the existing doc here to fall back to current values for fields the
        // client didn't send (partial updates).
        const formData = await req.formData();
        const data = extractEventFormData(formData);
        const imageFile = formData.get('image');
        const image = imageFile instanceof File && imageFile.size > 0
            ? await uploadEventImage(imageFile)
            : event.image;

        const result = await updateEvent(slug, userId, {
            title: data.title ?? event.title,
            description: data.description ?? event.description,
            overview: data.overview ?? event.overview,
            venue: data.venue ?? event.venue,
            location: data.location ?? event.location,
            date: data.date ?? event.date,
            time: data.time ?? event.time,
            mode: data.mode ?? event.mode,
            audience: data.audience ?? event.audience,
            organizer: data.organizer ?? event.organizer,
            tags: data.tags.length > 0 ? data.tags : event.tags,
            agenda: data.agenda.length > 0 ? data.agenda : event.agenda,
            image,
        });

        if (!result.success) {
            const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 500;
            return NextResponse.json(
                {message: 'Failed to update event', error: result.error},
                {status}
            );
        }

        return NextResponse.json({message: 'Event updated successfully', event: result.event}, {status: 200});
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            {
                message: 'Failed to update event',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            },
            {status: 500}
        );
    }
}
