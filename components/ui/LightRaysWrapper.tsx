'use client';

import dynamic from 'next/dynamic';

const LightRays = dynamic(() => import("@/components/ui/LightRays"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 top-0 z-[-1] min-h-screen bg-black"/>,
});

export default function LightRaysWrapper(props: React.ComponentProps<typeof LightRays>) {
    return <LightRays {...props} />;
}
