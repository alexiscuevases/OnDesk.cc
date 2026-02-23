import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const variantStyles = {
	agent: "bg-primary text-primary-foreground",
	customer: "bg-primary/10 text-primary",
	team: "bg-primary/10 text-primary",
	assignee: "bg-secondary text-secondary-foreground",
};

const sizeStyles = {
	xs: "size-5 text-[9px]",
	sm: "size-7 text-[11px]",
	md: "size-8 text-xs",
	lg: "size-10 text-sm",
};

const shapeStyles = {
	rounded: "rounded-lg",
	circle: "rounded-full",
};

const statusDotColors = {
	online: "bg-accent",
	away: "bg-warning",
	offline: "bg-muted-foreground",
};

interface UserAvatarProps {
	initials: string;
	variant?: keyof typeof variantStyles;
	size?: keyof typeof sizeStyles;
	shape?: keyof typeof shapeStyles;
	statusDot?: "online" | "away" | "offline" | null;
	className?: string;
}

export function UserAvatar({ initials, variant = "agent", size = "md", shape = "rounded", statusDot, className }: UserAvatarProps) {
	return (
		<div className="relative inline-flex shrink-0">
			<Avatar className={cn(sizeStyles[size], shapeStyles[shape], className)}>
				<AvatarFallback className={cn(sizeStyles[size], shapeStyles[shape], variantStyles[variant], "font-semibold")}>
					{initials}
				</AvatarFallback>
			</Avatar>
			{statusDot && (
				<span
					className={cn(
						"absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
						statusDotColors[statusDot]
					)}
				/>
			)}
		</div>
	);
}
