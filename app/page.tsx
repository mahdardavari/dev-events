import ExploreBtn from "@/components/ExploreBtn";
import Profile from "@/components/Profile";
import {Suspense} from "react";
import EventsList from "@/components/EventsList";

const Home = () => {

    return (
        <section>
            <Suspense fallback={<div>Loading profile...</div>}>
                <Profile/>
            </Suspense>
            <h1 className="text-center">The hub for Every Dev <br/>Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathon, Meetups, and Conference, All in One Place</p>
            <ExploreBtn/>

            <Suspense fallback={<div>Loading events...</div>}>
                <EventsList/>
            </Suspense>
        </section>
    )
}
export default Home
