import SearchBar from "@/components/SearchBar";
import {Suspense} from "react";
import EventsList from "@/components/EventsList";

export async function SearchSection({searchParams}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const {q = ""} = await searchParams;

    return (
        <>
            <SearchBar initialValue={q}/>
            <Suspense fallback={<div>Loading events...</div>}>
                <EventsList searchQuery={q}/>
            </Suspense>
        </>
    );
}