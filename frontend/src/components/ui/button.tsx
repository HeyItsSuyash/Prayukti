"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    // Base: 8px radius, semibold, normal case, smooth transition
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
    {
        variants: {
            variant: {
                // Primary — blue CTA
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-primary border border-transparent",
                // Destructive — error action
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
                // Outline — blue border, transparent bg
                outline:
                    "border border-primary text-primary bg-transparent hover:bg-primary/8 hover:text-primary",
                // Secondary — deep navy bg
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
                // Ghost — subtle bg on hover
                ghost:
                    "hover:bg-primary/10 hover:text-primary text-foreground",
                // Link — underline
                link:
                    "text-primary underline-offset-4 hover:underline p-0 h-auto",
                // Success
                success:
                    "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
                // Warning
                warning:
                    "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm",
                // Muted — secondary action
                muted:
                    "bg-muted text-muted-foreground hover:bg-muted/80 border border-border",
            },
            size: {
                sm:      "h-8 px-3 text-xs",
                default: "h-9 px-4 py-2",
                lg:      "h-10 px-6",
                xl:      "h-11 px-8 text-base",
                icon:    "h-9 w-9",
                "icon-sm": "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
