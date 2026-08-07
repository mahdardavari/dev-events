"use client";

import {useCallback, useRef, ChangeEvent} from "react";
import {useRouter} from "next/navigation";

/**
 * Debounced search input. Typing updates the URL `?q=` param (which the
 * server component reads to filter events), so navigation is SSR-friendly
 * and shareable.
 *
 * Gotchas:
 * - `debounceRef` holds the pending timer so a new keystroke cancels the
 *   previous one (classic debounce; 300ms).
 * - `isInitialMount` skips the very first change event so the input's initial
 *   `defaultValue` (restored from the URL on navigation) is never treated as a
 *   user search. Trade-off: a lone first keystroke won't trigger a search.
 */
export default function SearchBar({initialValue = ""}: { initialValue?: string }) {
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