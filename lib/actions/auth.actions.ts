"use server";

import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

/**
 * Creates a new user account from submitted form fields and redirects to the site root.
 *
 * Expects the provided FormData to contain string values for the fields `name`, `email`, and `password`.
 *
 * @param formData - FormData with `name`, `email`, and `password` fields used to create the account
 */
export async function signUpEmailAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await auth.api.signUpEmail({body: {name, email, password}});

    redirect("/");
}

/**
 * Processes sign-in form data, authenticates the user, and redirects to the app root.
 *
 * @param formData - FormData from a sign-in form; must include `email` and `password` fields
 */
export async function signInEmailAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await auth.api.signInEmail({
        body: {email, password},
    });

    redirect("/");
}

/**
 * Signs out the current user and redirects to the sign-in page.
 *
 * Uses the incoming request's headers when calling the sign-out endpoint.
 */
export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/sign-in");
}