import {NextRequest, NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, {IEvent} from '@/database/event.model';
import {v2 as cloudinary} from 'cloudinary';

type ApiResponse =
    | { message: string; event: IEvent }
    | { message: string; error: string };

async function uploadImage(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise<{secure_url: string}>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {resource_type: 'image', folder: 'DevEvent'},
            (error, results) => {
                if (error) return reject(error);
                resolve(results as {secure_url: string});
            }
        ).end(buffer);
    });
    return uploadResult.secure_url;
}

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
        const updateData: Record<string, string> = {};

        for (const [key, value] of formData.entries()) {
            if (key === 'image' || key === 'tags' || key === 'agenda') continue;
            if (typeof value === 'string') {
                updateData[key] = value;
            }
        }

        const imageFile = formData.get('image');
        if (imageFile instanceof File && imageFile.size > 0) {
            updateData.image = await uploadImage(imageFile);
        }

        const tagsRaw = formData.get('tags');
        if (typeof tagsRaw === 'string') {
            updateData.tags = tagsRaw;
        }
        const agendaRaw = formData.get('agenda');
        if (typeof agendaRaw === 'string') {
            updateData.agenda = agendaRaw;
        }

        Object.assign(event, {
            title: updateData.title ?? event.title,
            description: updateData.description ?? event.description,
            overview: updateData.overview ?? event.overview,
            venue: updateData.venue ?? event.venue,
            location: updateData.location ?? event.location,
            date: updateData.date ?? event.date,
            time: updateData.time ?? event.time,
            mode: updateData.mode ?? event.mode,
            audience: updateData.audience ?? event.audience,
            organizer: updateData.organizer ?? event.organizer,
            image: updateData.image ?? event.image,
            tags: updateData.tags ? JSON.parse(updateData.tags) : event.tags,
            agenda: updateData.agenda ? JSON.parse(updateData.agenda) : event.agenda,
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