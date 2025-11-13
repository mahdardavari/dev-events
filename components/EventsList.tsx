import EventCard from "@/components/EventCard";
import {getAllEvents} from "@/lib/actions/event.actions";
import {cacheLife, cacheTag} from "next/cache";

const EventsList = async () => {
    'use cache: private'
    cacheLife({stale: 60}) // Minimum 30 seconds required for runtime prefetch
    cacheTag("events")
    const events = await getAllEvents();

    return (
        <div className="mt-20 space-y-7">
            <h3>Featured Events</h3>
            <ul className="events">
                {events && events.length > 0 ? (
                    events.map((event) => (
                        <li key={event.title} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))
                ) : (
                    <p>No events found</p>
                )}
            </ul>
        </div>
    );
};

export default EventsList;
