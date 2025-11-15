"use server";

import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function signUpEmailAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await auth.api.signUpEmail({body: {name, email, password}});


    redirect("/");
}

export async function signInEmailAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await auth.api.signInEmail({
        body: {email, password},
    });

    redirect("/");
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/sign-in");
}
