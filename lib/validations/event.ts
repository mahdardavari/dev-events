import {z} from 'zod';

export const eventFormSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be under 100 characters'),
    description: z
        .string()
        .min(1, 'Description is required')
        .max(500, 'Description must be under 500 characters'),
    overview: z
        .string()
        .min(1, 'Overview is required')
        .max(2000, 'Overview must be under 2000 characters'),
    venue: z
        .string()
        .min(1, 'Venue is required')
        .max(100, 'Venue must be under 100 characters'),
    location: z
        .string()
        .min(1, 'Location is required')
        .max(100, 'Location must be under 100 characters'),
    date: z
        .string()
        .min(1, 'Date is required'),
    time: z
        .string()
        .min(1, 'Time is required')
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
    mode: z.enum(['online', 'offline', 'hybrid'], {
        error: 'Mode is required',
    }),
    audience: z
        .string()
        .min(1, 'Audience is required')
        .max(100, 'Audience must be under 100 characters'),
    organizer: z
        .string()
        .min(1, 'Organizer is required')
        .max(100, 'Organizer must be under 100 characters'),
    agendaText: z
        .string()
        .min(1, 'At least one agenda item is required'),
    tagsText: z
        .string()
        .min(1, 'At least one tag is required'),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function parseAgendaText(text: string): string[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

export function parseTagsText(text: string): string[] {
    return text
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

export function agendaToText(agenda: string[]): string {
    return agenda.join('\n');
}

export function tagsToText(tags: string[]): string {
    return tags.join(', ');
}
