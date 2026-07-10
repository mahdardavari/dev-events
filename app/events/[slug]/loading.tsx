export default function EventLoading() {
    return (
        <main className="animate-pulse">
            <div className="header">
                <div className="h-8 w-48 bg-white/10 rounded"/>
                <div className="h-4 w-96 bg-white/10 rounded mt-4"/>
            </div>
            <div className="details">
                <div className="content">
                    <div className="h-80 w-full bg-white/10 rounded"/>
                    <div className="h-6 w-32 bg-white/10 rounded mt-8"/>
                    <div className="h-4 w-full bg-white/10 rounded mt-3"/>
                    <div className="h-4 w-3/4 bg-white/10 rounded mt-2"/>
                </div>
                <aside className="booking">
                    <div className="signup-card">
                        <div className="h-6 w-40 bg-white/10 rounded"/>
                        <div className="h-4 w-64 bg-white/10 rounded mt-3"/>
                        <div className="h-10 w-full bg-white/10 rounded mt-4"/>
                    </div>
                </aside>
            </div>
        </main>
    );
}
