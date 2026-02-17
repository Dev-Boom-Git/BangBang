import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive: "border-transparent bg-destructive text-destructive-foreground",
                outline: "text-foreground",
                pending: "border-transparent bg-amber-100 text-amber-800",
                paid: "border-transparent bg-blue-100 text-blue-800",
                preparing: "border-transparent bg-indigo-100 text-indigo-800",
                shipping: "border-transparent bg-emerald-100 text-emerald-800",
                completed: "border-transparent bg-green-100 text-green-800",
                cancelled: "border-transparent bg-red-100 text-red-800",
                gold: "border-transparent bg-[hsl(30,50%,64%)] text-white",
                success: "border-transparent bg-green-100 text-green-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
