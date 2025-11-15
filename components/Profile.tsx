import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import Link from "next/link";
import {signOutAction} from "@/lib/actions/auth.actions";
import {LogOut} from 'lucide-react';

const Profile = async () => {
    const session = await auth.api.getSession({headers: await headers()});

    if (session?.user) {
        return (
            <div>
                <p>Welcome, {session.user.name} 👋</p>
                <form action={signOutAction}>
                    <button>
                        <LogOut className='cursor-pointer m-2' size={20}/>
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="flex gap-4 pb-4 sm:pb-0 ">
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
