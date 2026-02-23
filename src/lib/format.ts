import type { TicketStatus, TicketPriority } from "@/lib/data";

export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function getEmailInitials(email: string): string {
	return email
		.split("@")[0]
		.split(".")
		.map((n) => n[0].toUpperCase())
		.join("")
		.slice(0, 2);
}

export function formatEmailToName(email: string): string {
	return email
		.split("@")[0]
		.split(".")
		.map((n) => n.charAt(0).toUpperCase() + n.slice(1))
		.join(" ");
}

export function formatStatus(status: TicketStatus): string {
	return status.replace("-", " ");
}

export function formatPriority(priority: TicketPriority): string {
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}
