"use client"

import React, {useActionState} from 'react'
import {signInEmailAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import Link from "next/link";

const SignInPage = () => {
    const [state, formAction] = useActionState(signInEmailAction, null);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <form
                action={formAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Sign in</h1>
                {state?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm animate-[fadeInUp_300ms_ease-out]">
                        {state.error}
                    </div>
                )}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="w-full border p-2 rounded-md"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    className="w-full border p-2 rounded-md"
                />
                <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <SubmitButton variant="tertiary" size="lg" className="w-full">
                    Sign in
                </SubmitButton>
                <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up-email" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </main>
    )
}
export default SignInPage
