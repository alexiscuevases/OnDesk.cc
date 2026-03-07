import { MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TicketMessage } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Workspace } from "@/features/workspaces/api/workspaces-api";
import type { Company } from "@/features/companies/api/companies-api";

function decodeHtmlEntities(str: string) {
	const txt = document.createElement("textarea");
	txt.innerHTML = str;
	return txt.value;
}

function ShadowHtml({ html }: { html: string }) {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		if (!host.shadowRoot) host.attachShadow({ mode: "open" });

		const doc = new DOMParser().parseFromString(`<div>${decodeHtmlEntities(html)}</div>`, "text/html");
		const root = doc.body.firstElementChild!;

		function wrapInCollapsible(nodes: Node[], anchor: Node) {
			const wrapper = doc.createElement("div");
			const toggle = doc.createElement("button");
			const content = doc.createElement("div");
			toggle.textContent = "··· Show quoted text";
			toggle.style.cssText =
				"display:inline-flex;align-items:center;font-size:11px;color:#888;" +
				"background:transparent;border:1px solid #ddd;border-radius:6px;" +
				"padding:2px 8px;cursor:pointer;margin-bottom:4px;";
			content.style.cssText = "display:none;";
			toggle.setAttribute("data-quote-toggle", "true");
			content.setAttribute("data-quote-content", "true");
			for (const n of nodes) content.appendChild(n);
			wrapper.append(toggle, content);
			(anchor as Element).replaceWith(wrapper);
		}

		// 1. Collapse signature + everything after <br id="lineBreakAtBeginningOfSignature">
		const sigBr = root.querySelector("br#lineBreakAtBeginningOfSignature");
		if (sigBr) {
			const trailing: Node[] = [];
			let cur: Node | null = sigBr.nextSibling;
			while (cur) {
				trailing.push(cur);
				cur = cur.nextSibling;
			}
			if (trailing.length) {
				for (const n of trailing) n.parentNode!.removeChild(n);
				wrapInCollapsible(trailing, sigBr);
			} else {
				sigBr.remove();
			}
		}

		// 2. Collapse top-level blockquotes and common email quote wrappers
		const quoteSelectors = [
			"blockquote",
			"[class*='gmail_quote']",
			"[class*='moz-cite']",
			"[id*='appendonsend']",
			"[class*='yahoo_quoted']",
			"[class*='OutlookMessageHeader']",
			"[class*='BodyFragment']",
		].join(",");

		const seen: Element[] = [];
		for (const el of Array.from(root.querySelectorAll(quoteSelectors))) {
			if (!seen.some((s) => s.contains(el)) && !el.closest("[data-quote-content]")) {
				seen.push(el);
				wrapInCollapsible([el.cloneNode(true)], el);
			}
		}

		const shadow = host.shadowRoot!;
		shadow.innerHTML =
			`<style>
				[data-mention] {
				    color: var(--accent);
    				background-color: var(--background);
					border-radius: 4px;
					padding: 0 4px;
					font-weight: 500;
				}
			</style>` + root.outerHTML;

		// Wire up toggles after innerHTML reset
		for (const btn of Array.from(shadow.querySelectorAll("[data-quote-toggle]"))) {
			const panel = btn.nextElementSibling as HTMLElement;
			if (!panel) continue;
			btn.addEventListener("click", () => {
				const hidden = panel.style.display === "none";
				panel.style.display = hidden ? "block" : "none";
				btn.textContent = hidden ? "··· Hide quoted text" : "··· Show quoted text";
			});
		}
	}, [html]);

	return <div ref={hostRef} />;
}

interface TicketConversationProps {
	messages: TicketMessage[];
	members: WorkspaceMember[];
	contacts: Contact[];
	workspace: Workspace;
	companies: Company[];
}

export function TicketConversation({ messages, members, contacts, workspace, companies }: TicketConversationProps) {
	function getMsgContact(msg: TicketMessage): Contact | null {
		if (msg.author_type !== "contact" || !msg.author_id) return null;
		return contacts.find((c) => c.id === msg.author_id) ?? null;
	}

	function getAuthorName(msg: TicketMessage) {
		if (msg.author_type === "agent") {
			return members.find((m) => m.id === msg.author_id)?.name ?? "Agent";
		}
		return getMsgContact(msg)?.name ?? "Contact";
	}

	function getAuthorEmail(msg: TicketMessage) {
		if (msg.author_type === "agent") {
			return members.find((m) => m.id === msg.author_id)?.email ?? null;
		}
		return getMsgContact(msg)?.email ?? null;
	}

	function getAuthorAvatarSrc(msg: TicketMessage): string | undefined {
		if (msg.author_type === "agent") {
			const member = members.find((m) => m.id === msg.author_id);
			return member?.logo_url ?? workspace.logo_url ?? undefined;
		}
		const msgContact = getMsgContact(msg);
		return msgContact?.logo_url ?? companies.find((c) => c.id === msgContact?.company_id)?.logo_url ?? undefined;
	}

	function getInitials(name: string) {
		return name
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader className="pb-3">
				<div className="flex items-center gap-2">
					<MessageSquare className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Conversation</CardTitle>
					<Badge variant="secondary" className="text-[10px] rounded-full px-2 ml-auto">
						{messages.length} message{messages.length !== 1 ? "s" : ""}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				{messages.length > 0 ? (
					<div className="space-y-4">
						{messages.map((msg) => {
							const isInternal = msg.type === "note";
							const isAgent = msg.author_type === "agent";
							const authorName = getAuthorName(msg);
							const authorEmail = getAuthorEmail(msg);
							const avatarSrc = getAuthorAvatarSrc(msg);
							return (
								<div key={msg.id} className={isInternal ? "opacity-80" : ""}>
									<div
										className={`rounded-xl p-3.5 ${
											isInternal
												? "bg-warning/10 border border-warning/20 border-dashed"
												: isAgent
													? "bg-primary/5 border border-primary/10"
													: "bg-secondary/60 border border-border"
										}`}>
										<div className="flex items-center gap-2.5 mb-2.5">
											<Avatar className="size-8 rounded-lg shrink-0">
												<AvatarImage src={avatarSrc} className="object-cover rounded-lg" />
												<AvatarFallback
													className={`rounded-lg text-[10px] font-bold ${
														isAgent ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
													}`}>
													{getInitials(authorName)}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="text-xs font-semibold">{authorName}</span>
												{authorEmail && <span className="text-[10px] text-muted-foreground">{authorEmail}</span>}
											</div>
											{isInternal && (
												<Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-full border-warning text-warning ml-1">
													<Eye className="size-2.5 mr-0.5" />
													Internal
												</Badge>
											)}
											<span className="text-[10px] text-muted-foreground ml-auto">
												{format(new Date(msg.created_at * 1000), "MMM d, h:mm a")}
											</span>
										</div>
										<ShadowHtml html={msg.content} />
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
						<MessageSquare className="size-8 mb-2 opacity-30" />
						<p className="text-sm">No messages yet</p>
						<p className="text-xs">Start the conversation below</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
