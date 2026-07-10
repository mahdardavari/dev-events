"use client";

import {useState, useDeferredValue, useTransition, useEffect, useRef, ChangeEvent} from "react";
import {useRouter} from "next/navigation";

export default function SearchBar({initialValue = ""}: { initialValue?: string }) {
    const [value, setValue] = useState(initialValue);
    const deferredValue = useDeferredValue(value);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        startTransition(() => {
            const params = new URLSearchParams(window.location.search);
            if (deferredValue.trim()) {
                params.set("q", deferredValue);
            } else {
                params.delete("q");
            }

            router.push(`?${params.toString()}`, {scroll: false});
        });
    }, [deferredValue, router]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    return (
        <>
            <input
                type="text"
                placeholder="Search events…"
                className="border p-3 rounded-xl mt-7 mx-auto block w-full md:w-96"
                value={value}
                onChange={handleChange}
            />
            {isPending && <div className="text-center text-sm text-gray-500">Updating...</div>}
        </>
    );
}