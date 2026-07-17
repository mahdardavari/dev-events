import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import {v2 as cloudinary} from 'cloudinary';
import Event from "@/database/event.model";
import {getAllEvents} from "@/lib/actions/event.actions";

const REQUIRED_FIELDS = ['title', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'organizer'] as const;

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

function extractEventData(formData: FormData): Record<string, string> {
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
        if (key !== 'image' && key !== 'tags' && key !== 'agenda' && typeof value === 'string') {
            data[key] = value;
        }
    }
    return data;
}

function validateFields(data: Record<string, string>): string | null {
    for (const field of REQUIRED_FIELDS) {
        if (!data[field]?.trim()) {
            return `All required fields must be filled`;
        }
    }
    return null;
}

function parseJsonArray(value: unknown, fieldName: string): string[] | NextResponse {
    if (typeof value !== 'string') {
        return NextResponse.json({message: `${fieldName} are required`}, {status: 400});
    }
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return NextResponse.json({message: `At least one ${fieldName.slice(0, -1)} is required`}, {status: 400});
        }
        return parsed;
    } catch {
        return NextResponse.json({message: `Invalid JSON format for ${fieldName}`}, {status: 400});
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();

        const file = formData.get('image');
        if (!(file instanceof File)) {
            return NextResponse.json({message: 'Image file is required'}, {status: 400});
        }

        const tagsResult = parseJsonArray(formData.get('tags'), 'tags');
        if (tagsResult instanceof NextResponse) return tagsResult;

        const agendaResult = parseJsonArray(formData.get('agenda'), 'agenda');
        if (agendaResult instanceof NextResponse) return agendaResult;

        const eventData = extractEventData(formData);
        const validationError = validateFields(eventData);
        if (validationError) {
            return NextResponse.json({message: validationError}, {status: 400});
        }

        const imageUrl = await uploadImage(file);

        const createdEvent = await Event.create({
            ...eventData,
            image: imageUrl,
            tags: tagsResult,
            agenda: agendaResult,
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