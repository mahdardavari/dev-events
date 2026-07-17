"use client";

import {useState, useCallback, useRef, ChangeEvent} from "react";
import {useRouter} from "next/navigation";

export default function SearchBar({initialValue = ""}: { initialValue?: string }) {
    const [value, setValue] = useState(initialValue);
    const router = useRouter();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    const updateURL = useCallback((searchValue: string) => {
        const params = new URLSearchParams(window.location.search);
        if (searchValue.trim()) {
            params.set("q", searchValue);
        } else {
            params.delete("q");
        }
        router.push(`?${params.toString()}`, {scroll: false});
    }, [router]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            updateURL(newValue);
        }, 300);
    };

    return (
        <input
            type="text"
            placeholder="Search events…"
            className="border p-3 rounded-xl mt-7 mx-auto block w-full md:w-96"
            defaultValue={initialValue}
            onChange={handleChange}
        />
    );
}