import {Suspense} from "react";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import Link from "next/link";
import {signOutAction} from "@/lib/actions/auth.actions";
import {LogOut} from 'lucide-react';

const ProfileSkeleton = () => (
    <div className="flex gap-4 pb-4 sm:pb-0 animate-pulse">
        <div className="h-4 w-16 bg-gray-700 rounded"/>
        <div className="h-4 w-16 bg-gray-700 rounded"/>
    </div>
);

const ProfileContent = async () => {
    const session = await auth.api.getSession({headers: await headers()});

    if (session?.user) {
        return (
            <div className="flex items-center gap-2">
                <p>Welcome, {session.user.name}</p>
                <form action={signOutAction}>
                    <button type="submit" aria-label="Sign out">
                        <LogOut className='cursor-pointer m-2' size={20}/>
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="flex gap-4 pb-4 sm:pb-0">
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

const Profile = () => {
    return (
        <Suspense fallback={<ProfileSkeleton/>}>
            <ProfileContent />
        </Suspense>
    );
};

export default Profile;
