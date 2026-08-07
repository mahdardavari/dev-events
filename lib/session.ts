import {headers} from "next/headers";
import {auth} from "@/lib/auth";

/**
 * Returns the current session, or `null` when signed out or on error.
 * Server-only — do not import from client components.
 */
export async function getSession() {
    try {
        return await auth.api.getSession({headers: await headers()});
    } catch {
        return null;
    }
}
