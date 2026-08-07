import {NextRequest, NextResponse} from "next/server";
import {getAllEvents, createEvent} from "@/lib/services/event.service";
import {uploadEventImage} from "@/lib/cloudinary";
import {extractEventFormData} from "@/lib/event-form";

/**
 * REST API for events (POST create / GET list) — for external API consumers.
 * The app's own UI never calls this; it goes through the server actions in
 * `lib/actions/event.actions.ts`. Both entry points share the write logic via
 * `lib/services/event.service.ts`.
 *
 * ⚠️ SECURITY: `createdBy` is taken straight from client-supplied form data,
 * so any caller can attribute an event to another user. There is no session
 * check here, unlike the server-action path (see `app/create-event/page.tsx`).
 * Fix with real auth before exposing this publicly.
 */

// Fields validated manually here because the API path doesn't use the zod
// schema. Consider switching to `eventFormSchema.safeParse(...)` to avoid
// drift between client validation (zod) and this hand-rolled check.
const REQUIRED_FIELDS = ['title', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'organizer'] as const;

export async function POST(req: NextRequest) {
    try {
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

        const result = await createEvent({
            ...eventData,
            image: imageUrl,
            createdBy: formData.get('createdBy') as string,
        });

        if (result.success) {
            return NextResponse.json({message: 'Event created successfully', event: result.event}, {status: 201});
        }

        const status = result.code === 'DUPLICATE' ? 409 : 500;
        return NextResponse.json({message: 'Event creation failed', error: result.error}, {status});
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
