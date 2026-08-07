"use client"

import {useActionState} from 'react'
import {forgotPasswordAction} from "@/lib/actions/auth.actions";
import {SubmitButton} from "@/components/SubmitButton";
import {AuthCard} from "@/components/AuthCard";
import {FormAlert} from "@/components/FormAlert";
import Link from "next/link";

const ForgotPasswordPage = () => {
    const [state, formAction] = useActionState(forgotPasswordAction, null);

    return (
        <AuthCard
            title="Forgot password"
            footer={
                <>
                    Remember your password?{" "}
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
                {state?.success && (
                    <FormAlert type="success">
                        Check your email for a password reset link.
                    </FormAlert>
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
            </form>
        </AuthCard>
    )
}
export default ForgotPasswordPage
