import EventCard from "@/components/EventCard";
import {getFilteredEvents} from "@/lib/actions/event.actions";
import {cacheLife, cacheTag} from "next/cache";

const EventsList = async ({searchQuery = ""}: { searchQuery?: string }) => {
    'use cache: private';
    cacheLife({stale: 60});
    cacheTag("events");

    const events = await getFilteredEvents(searchQuery);

    return (
        <div className="mt-20 space-y-7">
            <h3>Featured Events</h3>
            {searchQuery && (
                <p className="text-sm text-gray-600">
                    Showing results for: <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                </p>
            )}
            <ul className="events">
                {events.length > 0 ? (
                    events.map((event) => (
                        <li key={event._id.toString()} className="list-none">
                            <EventCard {...event} />
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
