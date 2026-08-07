"use client"

import {useActionState} from 'react'
import {signInEmailAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import {AuthCard} from "@/components/AuthCard";
import {FormAlert} from "@/components/FormAlert";
import Link from "next/link";

const SignInPage = () => {
    const [state, formAction] = useActionState(signInEmailAction, null);

    return (
        <AuthCard
            title="Sign in"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up-email" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </>
            }
        >
            <form action={formAction} className="space-y-4">
                {state?.error && (
                    <FormAlert type="error">{state.error}</FormAlert>
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
            </form>
        </AuthCard>
    )
}
export default SignInPage
