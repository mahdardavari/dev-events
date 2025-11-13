"use client";

import React from "react";
import {useFormStatus} from "react-dom";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

// Define style variants for different looks and sizes
const buttonVariants = cva(
    "inline-flex items-center justify-center font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                primary: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
                secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400",
                tertiary: "bg-blue-200 text-blue-800 hover:bg-blue-300 focus-visible:ring-gray-400",
                danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
            },
            size: {
                sm: "h-8 px-3 text-sm",
                md: "h-10 px-4 text-base",
                lg: "h-12 px-6 text-lg",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

interface SubmitButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
}

export function SubmitButton({children, variant, size, className, ...props}: SubmitButtonProps) {
    const {pending} = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(buttonVariants({variant, size}), className)}
            {...props}
        >
            {pending ? (
                <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
          Loading...
        </span>
            ) : (
                children
            )}
        </button>
    );
}