import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: "default" | "danger";
};

export function Button({
    className,
    asChild = false,
    variant = "default",
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            className={clsx(
                "px-4 py-2 rounded-md font-medium transition",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",

                variant === "default" &&
                    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

                variant === "danger" &&
                    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

                className
            )}
            {...props}
        />
    );
}