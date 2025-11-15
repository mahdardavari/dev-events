import React from 'react'
import {signInEmailAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";

const SignInPage = () => {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <form
                action={signInEmailAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Sign in</h1>
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
                <SubmitButton variant="tertiary" size="lg" className="w-full">
                    Sign in
                </SubmitButton>
            </form>
        </main>
    )
}
export default SignInPage
