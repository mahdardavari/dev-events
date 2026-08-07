interface AuthCardProps {
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

/**
 * Shared layout for the sign-in / sign-up / password pages:
 * centered card with a title, content (usually a form), and an optional footer.
 */
export function AuthCard({title, children, footer}: AuthCardProps) {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="p-6 rounded-2xl shadow-lg space-y-4 w-80">
                <h1 className="text-2xl font-bold text-center">{title}</h1>
                {children}
                {footer && <p className="text-center text-sm text-gray-600">{footer}</p>}
            </div>
        </main>
    );
}
