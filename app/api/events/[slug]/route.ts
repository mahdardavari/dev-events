import {NextRequest, NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, {IEvent} from '@/database/event.model';
import {uploadEventImage} from '@/lib/cloudinary';
import {extractEventFormData} from '@/lib/event-form';

type ApiResponse =
    | { message: string; event: IEvent }
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

        if (event.createdBy !== userId) {
            return NextResponse.json(
                {message: 'Forbidden', error: 'You can only edit your own events'},
                {status: 403}
            );
        }

        const formData = await req.formData();
        const data = extractEventFormData(formData);
        const imageFile = formData.get('image');
        const image = imageFile instanceof File && imageFile.size > 0
            ? await uploadEventImage(imageFile)
            : event.image;

        Object.assign(event, {
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

        await event.save();

        return NextResponse.json({message: 'Event updated successfully', event}, {status: 200});
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
