import {Suspense} from "react";
import {notFound} from "next/navigation";
import Link from "next/link";
import {getSimilarEventsBySlug, getEventBySlug, getBookingCountByEventId} from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import {getSession} from "@/lib/session";
import {Pencil} from "lucide-react";

const EventDetailItem = ({icon, alt, label}: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} loading="lazy"/>
        <p>{label}</p>
    </div>
);

const EventAgenda = ({agendaItems}: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({tags}: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
);

const SimilarEvents = async ({slug}: { slug: string }) => {
    const similarEvents = await getSimilarEventsBySlug(slug);

    if (similarEvents.length === 0) return null;

    return (
        <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
                {similarEvents.map((similarEvent) => (
                    <EventCard key={similarEvent._id} {...similarEvent} />
                ))}
            </div>
        </div>
    );
};

const BookingCount = async ({eventId}: { eventId: string }) => {
    const bookings = await getBookingCountByEventId(eventId);
    return bookings > 0 ? (
        <p className="text-sm">
            Join {bookings} people who have already booked their spot!
        </p>
    ) : (
        <p className="text-sm">Be the first to book your spot!</p>
    );
};

const BookingSection = ({eventId, slug, isLoggedIn}: { eventId: string; slug: string; isLoggedIn: boolean }) => {
    return (
        <aside className="booking">
            <div className="signup-card">
                <h2>Book Your Spot</h2>
                <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
                    <BookingCount eventId={eventId}/>
                </Suspense>
                {isLoggedIn ? (
                    <BookEvent eventId={eventId} slug={slug}/>
                ) : (
                    <div className="flex flex-col gap-3 mt-4">
                        <p className="text-sm text-gray-400">
                            Sign in to book your spot at this event.
                        </p>
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-[160ms] ease-out text-sm font-medium active:scale-[0.97]"
                        >
                            Sign In
                        </Link>
                        <p className="text-xs text-gray-500 text-center">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up-email" className="text-green-500 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
};

const OwnerCheck = ({slug, isOwner}: { slug: string; isOwner: boolean }) => {
    if (!isOwner) return null;

    return (
        <Link
            href={`/edit-event/${slug}`}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition duration-[160ms] ease-out active:scale-[0.97]"
        >
            <Pencil size={14}/>
            Edit
        </Link>
    );
};

const EventDetails = async ({slug}: { slug: string }) => {
    const [event, session] = await Promise.all([getEventBySlug(slug), getSession()]);

    if (!event || !event.description) return notFound();

    const {description, image, overview, date, time, location, mode, agenda, audience, tags, organizer, _id, createdBy} = event;

    const isLoggedIn = !!session?.user;
    const isOwner = isLoggedIn && session?.user?.id === createdBy;

    return (
        <section id="event">
            <div className="header">
                <div className="flex items-center gap-4">
                    <h1>Event Description</h1>
                    <OwnerCheck slug={slug} isOwner={isOwner}/>
                </div>
                <p>{description}</p>
            </div>

            <div className="details">
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" priority/>

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date}/>
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time}/>
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location}/>
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode}/>
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience}/>
                    </section>

                    <EventAgenda agendaItems={agenda}/>

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags}/>
                </div>

                <BookingSection eventId={_id} slug={slug} isLoggedIn={isLoggedIn}/>
            </div>

            <Suspense fallback={null}>
                <SimilarEvents slug={slug}/>
            </Suspense>
        </section>
    );
};

export default EventDetails;
