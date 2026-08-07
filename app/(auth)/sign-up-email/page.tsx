"use client"

import {useActionState} from 'react'
import {signUpEmailAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/ui/SubmitButton";
import {AuthCard} from "@/components/ui/AuthCard";
import {FormAlert} from "@/components/ui/FormAlert";
import Link from "next/link";

const SignUpEmailPage = () => {
    const [state, formAction] = useActionState(signUpEmailAction, null);

    return (
        <AuthCard
            title="Sign up with email"
            footer={
                <>
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form action={formAction} className="space-y-4">
                {state?.error && (
                    <FormAlert type="error">{state.error}</FormAlert>
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
            </form>
        </AuthCard>
    )
}
export default SignUpEmailPage
