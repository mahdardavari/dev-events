import {Metadata} from 'next';
import {notFound, redirect} from 'next/navigation';
import {EventForm} from '@/components/forms/EventForm';
import {getEventForEdit, updateEvent} from '@/lib/actions/event.actions';
import {getSession} from '@/lib/session';
import {uploadEventImage} from '@/lib/cloudinary';
import {extractEventFormData} from '@/lib/event-form';
import {Suspense} from 'react';

export const metadata: Metadata = {
    title: 'Edit Event | DevEvent',
    description: 'Edit your event on DevEvent',
};

async function handleUpdateEvent(slug: string, formData: FormData) {
    'use server';

    const session = await getSession();
    if (!session?.user) {
        redirect('/sign-in');
    }

    const imageFile = formData.get('image');

    const input = {
        ...extractEventFormData(formData),
        image: imageFile instanceof File && imageFile.size > 0
            ? await uploadEventImage(imageFile)
            : (formData.get('currentImage') as string),
    };

    const result = await updateEvent(slug, session.user.id, input);

    if (result.success && result.event) {
        return {success: true, slug: result.event.slug};
    }

    return {success: false, error: result.error};
}

async function EditEventContent({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const session = await getSession();
    if (!session?.user) {
        redirect('/sign-in');
    }

    const result = await getEventForEdit(slug, session.user.id);

    if (!result.success || !result.event) {
        notFound();
    }

    const event = result.event;

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
                <p className="text-gray-400 mb-8">
                    Update the details of your event.
                </p>
                <EventForm
                    mode="edit"
                    initialData={{
                        title: event.title,
                        description: event.description,
                        overview: event.overview,
                        image: event.image,
                        venue: event.venue,
                        location: event.location,
                        date: event.date,
                        time: event.time,
                        mode: event.mode as 'online' | 'offline' | 'hybrid',
                        audience: event.audience,
                        organizer: event.organizer,
                        agenda: event.agenda,
                        tags: event.tags,
                    }}
                    onSubmit={handleUpdateEvent.bind(null, slug)}
                />
            </div>
        </main>
    );
}

const EditEventPage = ({params}: { params: Promise<{ slug: string }> }) => {
    return (
        <Suspense>
            <EditEventContent params={params} />
        </Suspense>
    );
};

export default EditEventPage;
