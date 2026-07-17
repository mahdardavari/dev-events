"use client"

import React, {useActionState} from 'react'
import {signUpEmailAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import Link from "next/link";

const SignUpEmailPage = () => {
    const [state, formAction] = useActionState(signUpEmailAction, null);

    return (
        <section className="min-h-screen flex items-center justify-center">
            <form
                action={formAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Sign up with email</h1>
                {state?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm animate-[fadeInUp_300ms_ease-out]">
                        {state.error}
                    </div>
                )}
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    required
                    className="w-full border p-2 rounded-md"
                />
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
                    minLength={8}
                    className="w-full border p-2 rounded-md"
                />
                <SubmitButton
                    className="w-full"
                    size="lg"
                >
                    Create account
                </SubmitButton>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </section>
    )
}
export default SignUpEmailPage
