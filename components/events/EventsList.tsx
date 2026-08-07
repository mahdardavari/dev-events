import EventCard from "./EventCard";
import {getFilteredEvents} from "@/lib/services/event.service";
import {IEventLean} from "@/lib/models/event.model";

const EventsList = async ({searchQuery = ""}: { searchQuery?: string }) => {
    let events: IEventLean[] = [];
    let total = 0;

    try {
        const result = await getFilteredEvents(searchQuery);
        events = result.events;
        total = result.total;
    } catch {
        // e.g. database unreachable — degrade gracefully instead of crashing the page
        return (
            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>
                <p className="text-sm text-red-400">
                    We couldn&apos;t load events right now. Please try again later.
                </p>
            </div>
        );
    }

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
