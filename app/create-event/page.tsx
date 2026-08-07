import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {EventForm} from '@/components/forms/EventForm';
import {createEvent} from '@/lib/services/event.service';
import {getSession} from '@/lib/session';
import {uploadEventImage} from '@/lib/cloudinary';
import {extractEventFormData} from '@/lib/event-form';
import {Suspense} from 'react';

export const metadata: Metadata = {
    title: 'Create Event | DevEvent',
    description: 'Create a new developer event on DevEvent',
};

async function handleCreateEvent(formData: FormData) {
    'use server';

    const session = await getSession();
    if (!session?.user) {
        redirect('/sign-in');
    }

    const file = formData.get('image');
    if (!(file instanceof File)) {
        return {success: false, error: 'Image is required'};
    }

    const image = await uploadEventImage(file);

    const result = await createEvent({
        ...extractEventFormData(formData),
        image,
        createdBy: session.user.id,
    });

    if (!result.success) {
        return {success: false, error: result.error};
    }

    return {success: true, slug: result.event.slug};
}

async function CreateEventContent() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/sign-in');
    }

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
                <p className="text-gray-400 mb-8">
                    Fill in the details below to create your developer event.
                </p>
                <EventForm mode="create" onSubmit={handleCreateEvent}/>
            </div>
        </main>
    );
}

const CreateEventPage = async () => {
    return (
        <Suspense>
            <CreateEventContent />
        </Suspense>
    );
};

export default CreateEventPage;
