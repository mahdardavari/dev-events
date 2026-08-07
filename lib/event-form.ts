/**
 * Extracts the event fields from an EventForm submission.
 * The client sends `agenda` and `tags` as JSON strings — they are parsed here.
 * Server-only (reads FormData sent to server actions / route handlers).
 */
function parseArrayField(formData: FormData, key: string): string[] {
    const raw = formData.get(key);
    if (typeof raw !== "string" || !raw.trim()) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function extractEventFormData(formData: FormData) {
    return {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        overview: formData.get("overview") as string,
        venue: formData.get("venue") as string,
        location: formData.get("location") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        mode: formData.get("mode") as "online" | "offline" | "hybrid",
        audience: formData.get("audience") as string,
        organizer: formData.get("organizer") as string,
        agenda: parseArrayField(formData, "agenda"),
        tags: parseArrayField(formData, "tags"),
    };
}
