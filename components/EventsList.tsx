import EventCard from "@/components/EventCard";
import {getAllEvents} from "@/lib/actions/event.actions";
import {cacheLife, cacheTag} from "next/cache";

const EventsList = async ({searchQuery = ""}: { searchQuery?: string }) => {
    'use cache: private'
    cacheLife({stale: 60}) // Minimum 30 seconds required for runtime prefetch
    cacheTag("events")
    
    const events = await getAllEvents();

    const filteredEvents = searchQuery
        ? events.filter(event =>
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : events;

    return (
        <div className="mt-20 space-y-7">
            <h3>Featured Events</h3>
            {searchQuery && (
                <p className="text-sm text-gray-600">
                    Showing results for: <span className="font-semibold">"{searchQuery}"</span>
                </p>
            )}
            <ul className="events">
                {filteredEvents && filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <li key={event.title} className="list-none">
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
