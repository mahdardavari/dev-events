"use client"

import React, {useActionState} from 'react'
import {forgotPasswordAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import Link from "next/link";

const ForgotPasswordPage = () => {
    const [state, formAction] = useActionState(forgotPasswordAction, null);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <form
                action={formAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Forgot password</h1>
                {state?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm animate-[fadeInUp_300ms_ease-out]">
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-sm animate-[fadeInUp_300ms_ease-out]">
                        Check your email for a password reset link.
                    </div>
                )}
                <p className="text-sm text-gray-600 text-center">
                    Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="w-full border p-2 rounded-md"
                />
                <SubmitButton variant="tertiary" size="lg" className="w-full">
                    Send reset link
                </SubmitButton>
                <p className="text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </main>
    )
}
export default ForgotPasswordPage
