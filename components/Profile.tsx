import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import Link from "next/link";

// export const dynamic = "force-dynamic"; // required for session checks

const Profile = async () => {
    const session = await auth.api.getSession({headers: await headers()});

    if (session?.user) {
        return <p>Welcome, {session.user.name} 👋</p>;
    }

    return (
        <div className="flex gap-4  mt-4">
            <Link href="/sign-up-email" className="text-white hover:underline">
                Sign Up
            </Link>
            <span>/</span>
            <Link href="/sign-in" className="text-white hover:underline">
                Sign In
            </Link>
        </div>
    );
};

export default Profile;
