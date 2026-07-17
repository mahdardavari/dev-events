import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';
import {EventForm} from '@/components/forms/EventForm';
import {createEvent} from '@/lib/actions/event.actions';

export const metadata: Metadata = {
    title: 'Create Event | DevEvent',
    description: 'Create a new developer event on DevEvent',
};

async function handleCreateEvent(formData: FormData) {
    'use server';

    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user) {
        redirect('/sign-in');
    }

    const file = formData.get('image');
    if (!(file instanceof File)) {
        return {success: false, error: 'Image is required'};
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const {v2: cloudinary} = await import('cloudinary');
    const uploadResult = await new Promise<{secure_url: string}>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {resource_type: 'image', folder: 'DevEvent'},
            (error, results) => {
                if (error) return reject(error);
                resolve(results as {secure_url: string});
            }
        ).end(buffer);
    });

    const result = await createEvent({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        overview: formData.get('overview') as string,
        image: uploadResult.secure_url,
        venue: formData.get('venue') as string,
        location: formData.get('location') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        mode: formData.get('mode') as 'online' | 'offline' | 'hybrid',
        audience: formData.get('audience') as string,
        organizer: formData.get('organizer') as string,
        agenda: JSON.parse(formData.get('agenda') as string),
        tags: JSON.parse(formData.get('tags') as string),
        createdBy: session.user.id,
    });

    if (result.success && result.event) {
        return {success: true, slug: result.event.slug};
    }

    return {success: false, error: result.error};
}

const CreateEventPage = async () => {
    const session = await auth.api.getSession({headers: await headers()});

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
};

export default CreateEventPage;
