'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {
    eventFormSchema,
    EventFormValues,
    parseAgendaText,
    parseTagsText,
    agendaToText,
    tagsToText,
} from '@/lib/validations/event';
import {InputField, TextareaField, SelectField} from '@/components/forms/FormField';
import {ImageUpload} from '@/components/forms/ImageUpload';
import {SubmitButton} from '@/components/SubmitButton';

interface EventFormProps {
    mode: 'create' | 'edit';
    initialData?: {
        title: string;
        description: string;
        overview: string;
        image: string;
        venue: string;
        location: string;
        date: string;
        time: string;
        mode: 'online' | 'offline' | 'hybrid';
        audience: string;
        organizer: string;
        agenda: string[];
        tags: string[];
    };
    onSubmit: (data: FormData) => Promise<{success: boolean; error?: string; slug?: string}>;
}

const MODE_OPTIONS = [
    {value: 'online', label: 'Online'},
    {value: 'offline', label: 'Offline'},
    {value: 'hybrid', label: 'Hybrid'},
];

export function EventForm({mode, initialData, onSubmit}: EventFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                description: initialData.description,
                overview: initialData.overview,
                venue: initialData.venue,
                location: initialData.location,
                date: initialData.date,
                time: initialData.time,
                mode: initialData.mode,
                audience: initialData.audience,
                organizer: initialData.organizer,
                agendaText: agendaToText(initialData.agenda),
                tagsText: tagsToText(initialData.tags),
            }
            : {
                mode: 'offline',
            },
    });

    const handleFormSubmit = async (data: EventFormValues) => {
        setSubmitError(null);
        setImageError(null);

        if (mode === 'create' && !imageFile) {
            setImageError('Image is required');
            return;
        }

        if (imageFile && imageFile.size > 5 * 1024 * 1024) {
            setImageError('Image must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('overview', data.overview);
        formData.append('venue', data.venue);
        formData.append('location', data.location);
        formData.append('date', data.date);
        formData.append('time', data.time);
        formData.append('mode', data.mode);
        formData.append('audience', data.audience);
        formData.append('organizer', data.organizer);
        formData.append('agenda', JSON.stringify(parseAgendaText(data.agendaText)));
        formData.append('tags', JSON.stringify(parseTagsText(data.tagsText)));

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (mode === 'edit' && initialData?.image) {
            formData.append('currentImage', initialData.image);
        }

        const result = await onSubmit(formData);

        if (result.success) {
            router.push('/');
            router.refresh();
        } else {
            setSubmitError(result.error || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl mx-auto space-y-6">
            {submitError && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 animate-[fadeInUp_300ms_ease-out]">
                    {submitError}
                </div>
            )}

            <InputField
                label="Title"
                name="title"
                placeholder="Enter event title"
                register={register('title')}
                error={errors.title}
                required
            />

            <TextareaField
                label="Description"
                name="description"
                placeholder="Brief description of the event"
                rows={3}
                register={register('description')}
                error={errors.description}
                required
            />

            <TextareaField
                label="Overview"
                name="overview"
                placeholder="Detailed overview of the event"
                rows={4}
                register={register('overview')}
                error={errors.overview}
                required
            />

            <ImageUpload
                name="image"
                currentImage={initialData?.image}
                error={imageError ?? undefined}
                onChange={setImageFile}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Venue"
                    name="venue"
                    placeholder="Event venue name"
                    register={register('venue')}
                    error={errors.venue}
                    required
                />
                <InputField
                    label="Location"
                    name="location"
                    placeholder="City, Country"
                    register={register('location')}
                    error={errors.location}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                    label="Date"
                    name="date"
                    type="date"
                    register={register('date')}
                    error={errors.date}
                    required
                />
                <InputField
                    label="Time"
                    name="time"
                    type="time"
                    register={register('time')}
                    error={errors.time}
                    required
                />
                <SelectField
                    label="Mode"
                    name="mode"
                    options={MODE_OPTIONS}
                    register={register('mode')}
                    error={errors.mode}
                    required
                />
            </div>

            <InputField
                label="Audience"
                name="audience"
                placeholder="e.g., Developers, Designers, Students"
                register={register('audience')}
                error={errors.audience}
                required
            />

            <InputField
                label="Organizer"
                name="organizer"
                placeholder="Organizer name or company"
                register={register('organizer')}
                error={errors.organizer}
                required
            />

            <TextareaField
                label="Agenda (one item per line)"
                name="agendaText"
                placeholder={"10:00 AM - Registration\n10:30 AM - Opening Keynote\n11:00 AM - Workshop"}
                rows={4}
                register={register('agendaText')}
                error={errors.agendaText}
                required
            />

            <InputField
                label="Tags (comma separated)"
                name="tagsText"
                placeholder="react, javascript, webdev"
                register={register('tagsText')}
                error={errors.tagsText}
                required
            />

            <div className="flex gap-4 pt-4">
                <SubmitButton variant="primary" size="lg" disabled={isSubmitting}>
                    {isSubmitting
                        ? mode === 'create'
                            ? 'Creating...'
                            : 'Saving...'
                        : mode === 'create'
                            ? 'Create Event'
                            : 'Save Changes'}
                </SubmitButton>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors active:scale-[0.97] transition-transform duration-[160ms] ease-out"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
