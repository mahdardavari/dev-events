import EventCard from "@/components/EventCard";
import {getFilteredEvents} from "@/lib/actions/event.actions";
import {cacheLife, cacheTag} from "next/cache";

const EventsList = async ({searchQuery = ""}: { searchQuery?: string }) => {
    'use cache: private';
    cacheLife({stale: 60});
    cacheTag(`events-${searchQuery}`);

    const {events, total} = await getFilteredEvents(searchQuery);

    return (
        <div className="mt-20 space-y-7">
            <h3>Featured Events</h3>
            {searchQuery && (
                <p className="text-sm text-gray-600">
                    Showing results for: <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                    <span className="ml-2">({total} found)</span>
                </p>
            )}
            <ul className="events">
                {events.length > 0 ? (
                    events.map((event, index) => (
                        <li key={event._id.toString()} className="list-none animate-[fadeInUp_400ms_ease-out_backwards]"
                            style={{animationDelay: `${Math.min(index, 7) * 60}ms`}}>
                            <EventCard {...event} priority={index < 3} />
                        </li>
                    ))
                ) : (
                    <p>No events found{searchQuery ? ` for "${searchQuery}"` : ""}</p>
                )}
            </ul>
        </div>
    );
};

export default EventsList;
