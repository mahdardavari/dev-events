import Profile from "@/components/Profile";
import {Suspense} from "react";
import {SearchSection} from "@/components/SearchSection";

export default function Home({searchParams}: {
    searchParams: Promise<{ q?: string }>;
}) {
    return (
        <section>
            <Suspense fallback={<div>Loading profile...</div>}>
                <Profile/>
            </Suspense>
            <h1 className="text-center">The hub for Every Dev <br/>Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathon, Meetups, and Conference, All in One Place</p>

            {/* Wrap the part that awaits searchParams in Suspense */}
            <Suspense fallback={<div>Loading search...</div>}>
                <SearchSection searchParams={searchParams}/>
            </Suspense>
        </section>
    )
}

