"use server";

import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

interface AuthError {
    body?: { message?: string };
    message?: string;
}

function getAuthErrorMessage(e: unknown, fallback: string): string {
    const err = e as AuthError | null;
    return err?.body?.message || err?.message || fallback;
}

export async function signUpEmailAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<{ error: string }> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        await auth.api.signUpEmail({body: {name, email, password}});
    } catch (e: unknown) {
        return { error: getAuthErrorMessage(e, "Something went wrong. Please try again.") };
    }

    redirect("/");
}

export async function signInEmailAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<{ error: string }> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        await auth.api.signInEmail({
            body: {email, password},
        });
    } catch (e: unknown) {
        return { error: getAuthErrorMessage(e, "Invalid email or password.") };
    }

    redirect("/");
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/sign-in");
}

export async function forgotPasswordAction(
    prevState: { error: string; success: boolean } | null,
    formData: FormData
): Promise<{ error: string; success: boolean }> {
    const email = formData.get("email") as string;

    try {
        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo: "/reset-password",
            },
        });
    } catch (e: unknown) {
        return { error: getAuthErrorMessage(e, "Something went wrong. Please try again."), success: false };
    }

    return { error: "", success: true };
}

export async function resetPasswordAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<{ error: string }> {
    const password = formData.get("password") as string;
    const token = formData.get("token") as string;

    try {
        await auth.api.resetPassword({
            body: {
                newPassword: password,
                token,
            },
        });
    } catch (e: unknown) {
        return { error: getAuthErrorMessage(e, "Invalid or expired token. Please try again.") };
    }

    redirect("/sign-in");
}
