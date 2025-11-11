import React from 'react'
import {signInEmailAction} from "@/lib/actions/auth.actions";

const SignInPage = () => {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <form
                action={signInEmailAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Login</h1>
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
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                    Sign in
                </button>
            </form>
        </main>
    )
}
export default SignInPage
