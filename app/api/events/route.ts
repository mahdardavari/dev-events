import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {getAllEvents} from "@/lib/actions/event.actions";
import {uploadEventImage} from "@/lib/cloudinary";
import {extractEventFormData} from "@/lib/event-form";

const REQUIRED_FIELDS = ['title', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'organizer'] as const;

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();

        const file = formData.get('image');
        if (!(file instanceof File)) {
            return NextResponse.json({message: 'Image file is required'}, {status: 400});
        }

        const tagsRaw = formData.get('tags');
        const agendaRaw = formData.get('agenda');
        if (typeof tagsRaw !== 'string' || !tagsRaw.trim()) {
            return NextResponse.json({message: 'Tags are required'}, {status: 400});
        }
        if (typeof agendaRaw !== 'string' || !agendaRaw.trim()) {
            return NextResponse.json({message: 'Agenda is required'}, {status: 400});
        }

        const eventData = extractEventFormData(formData);
        for (const field of REQUIRED_FIELDS) {
            if (!eventData[field]?.trim()) {
                return NextResponse.json({message: 'All required fields must be filled'}, {status: 400});
            }
        }
        if (eventData.tags.length === 0) {
            return NextResponse.json({message: 'At least one tag is required'}, {status: 400});
        }
        if (eventData.agenda.length === 0) {
            return NextResponse.json({message: 'At least one agenda item is required'}, {status: 400});
        }

        const imageUrl = await uploadEventImage(file);

        const createdEvent = await Event.create({
            ...eventData,
            image: imageUrl,
            createdBy: formData.get('createdBy') as string,
        });

        return NextResponse.json({message: 'Event created successfully', event: createdEvent}, {status: 201});
    } catch (e) {
        console.error('Event creation error:', e);
        return NextResponse.json({
            message: 'Event creation failed',
            error: e instanceof Error ? e.message : 'Unknown error',
        }, {status: 500});
    }
}

export async function GET() {
    try {
        const events = await getAllEvents();
        return NextResponse.json({message: "Events fetched successfully", events}, {status: 200});
    } catch (e) {
        return NextResponse.json({
            message: "Event fetching failed",
            error: e instanceof Error ? e.message : 'Unknown error',
        }, {status: 500});
    }
}
