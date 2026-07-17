import {Metadata} from 'next';
import {notFound, redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';
import {EventForm} from '@/components/forms/EventForm';
import {getEventForEdit, updateEvent} from '@/lib/actions/event.actions';
import {v2 as cloudinary} from 'cloudinary';

export const metadata: Metadata = {
    title: 'Edit Event | DevEvent',
    description: 'Edit your event on DevEvent',
};

async function handleUpdateEvent(slug: string, formData: FormData) {
    'use server';

    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user) {
        redirect('/sign-in');
    }

    const imageFile = formData.get('image');
    let imageUrl: string | undefined;

    if (imageFile instanceof File && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
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

        imageUrl = uploadResult.secure_url;
    }

    const input: Parameters<typeof updateEvent>[2] = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        overview: formData.get('overview') as string,
        image: imageUrl ?? (formData.get('currentImage') as string),
        venue: formData.get('venue') as string,
        location: formData.get('location') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        mode: formData.get('mode') as 'online' | 'offline' | 'hybrid',
        audience: formData.get('audience') as string,
        organizer: formData.get('organizer') as string,
        agenda: JSON.parse(formData.get('agenda') as string),
        tags: JSON.parse(formData.get('tags') as string),
    };

    const result = await updateEvent(slug, session.user.id, input);

    if (result.success && result.event) {
        return {success: true, slug: result.event.slug};
    }

    return {success: false, error: result.error};
}

const EditEventPage = async ({params}: { params: Promise<{ slug: string }> }) => {
    const {slug} = await params;

    const session = await auth.api.getSession({headers: await headers()});
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
                    onSubmit={(formData) => handleUpdateEvent(slug, formData)}
                />
            </div>
        </main>
    );
};

export default EditEventPage;
