"use client"

import React, {useActionState, Suspense} from 'react'
import {resetPasswordAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import Link from "next/link";
import {useSearchParams} from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [state, formAction] = useActionState(resetPasswordAction, null);

    if (!token) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="p-6 rounded-2xl shadow-lg space-y-4 w-80 text-center">
                    <h1 className="text-2xl font-bold">Invalid link</h1>
                    <p className="text-sm text-gray-600">
                        This password reset link is invalid or missing a token.
                    </p>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                        Request a new reset link
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <form
                action={formAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Reset password</h1>
                {state?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
                        {state.error}
                    </div>
                )}
                <input type="hidden" name="token" value={token} />
                <input
                    type="password"
                    name="password"
                    placeholder="New password"
                    required
                    minLength={8}
                    className="w-full border p-2 rounded-md"
                />
                <SubmitButton variant="tertiary" size="lg" className="w-full">
                    Reset password
                </SubmitButton>
                <p className="text-center text-sm text-gray-600">
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </form>
        </main>
    );
}

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </main>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
};
export default ResetPasswordPage;
