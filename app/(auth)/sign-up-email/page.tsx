import React from 'react'
import {signUpEmailAction} from "@/lib/actions/auth.actions";

const SignUpEmailPage = () => {
    return (
        <section className="min-h-screen flex items-center justify-center">
            <form
                action={signUpEmailAction}
                className="p-6 rounded-2xl shadow-lg space-y-4 w-80"
            >
                <h1 className="text-2xl font-bold text-center">Register</h1>
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
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                    Create account
                </button>
            </form>
        </section>
    )
}
export default SignUpEmailPage
