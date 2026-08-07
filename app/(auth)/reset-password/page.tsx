"use client"

import {useActionState, Suspense} from 'react'
import {resetPasswordAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/ui/SubmitButton";
import {AuthCard} from "@/components/ui/AuthCard";
import {FormAlert} from "@/components/ui/FormAlert";
import Link from "next/link";
import {useSearchParams} from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [state, formAction] = useActionState(resetPasswordAction, null);

    if (!token) {
        return (
            <AuthCard title="Invalid link">
                <p className="text-sm text-gray-600 text-center">
                    This password reset link is invalid or missing a token.
                </p>
                <div className="text-center">
                    <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                        Request a new reset link
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Reset password"
            footer={
                <Link href="/sign-in" className="text-blue-600 hover:underline">
                    Back to sign in
                </Link>
            }
        >
            <form action={formAction} className="space-y-4">
                {state?.error && (
                    <FormAlert type="error">{state.error}</FormAlert>
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
            </form>
        </AuthCard>
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
