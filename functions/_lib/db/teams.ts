import type { TeamRow, PublicTeam } from "../types";

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function findTeamsByWorkspace(db: D1Database, workspaceId: string): Promise<PublicTeam[]> {
	const result = await db
		.prepare("SELECT id, workspace_id, name, description, leader_id, logo_url, created_at FROM teams WHERE workspace_id = ? ORDER BY name ASC")
		.bind(workspaceId)
		.all<PublicTeam>();
	return result.results ?? [];
}

export async function findTeamById(db: D1Database, teamId: string): Promise<TeamRow | null> {
	const result = await db.prepare("SELECT * FROM teams WHERE id = ? LIMIT 1").bind(teamId).first<TeamRow>();
	return result ?? null;
}

export async function createTeam(
	db: D1Database,
	workspaceId: string,
	data: { name: string; description?: string; leader_id?: string; logo_url?: string },
): Promise<TeamRow> {
	const id = crypto.randomUUID();
	await db
		.prepare("INSERT INTO teams (id, workspace_id, name, description, leader_id, logo_url) VALUES (?, ?, ?, ?, ?, ?)")
		.bind(id, workspaceId, data.name, data.description ?? null, data.leader_id ?? null, data.logo_url ?? null)
		.run();
	return (await findTeamById(db, id))!;
}

export async function updateTeam(
	db: D1Database,
	teamId: string,
	data: { name?: string; description?: string; leader_id?: string | null; logo_url?: string | null },
): Promise<void> {
	const fields: string[] = [];
	const values: (string | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.leader_id !== undefined) {
		fields.push("leader_id = ?");
		values.push(data.leader_id);
	}
	if (data.logo_url !== undefined) {
		fields.push("logo_url = ?");
		values.push(data.logo_url);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(teamId);
	await db
		.prepare(`UPDATE teams SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteTeam(db: D1Database, teamId: string): Promise<void> {
	await db.prepare("DELETE FROM teams WHERE id = ?").bind(teamId).run();
}

export async function findTeamMembers(db: D1Database, teamId: string): Promise<{ id: string; name: string; email: string }[]> {
	const result = await db
		.prepare(
			`SELECT u.id, u.name, u.email FROM users u
       JOIN team_members tm ON tm.user_id = u.id
       WHERE tm.team_id = ? ORDER BY u.name ASC`,
		)
		.bind(teamId)
		.all<{ id: string; name: string; email: string }>();
	return result.results ?? [];
}

export async function addTeamMember(db: D1Database, teamId: string, userId: string): Promise<void> {
	const id = crypto.randomUUID();
	await db.prepare("INSERT OR IGNORE INTO team_members (id, team_id, user_id) VALUES (?, ?, ?)").bind(id, teamId, userId).run();
}

export async function removeTeamMember(db: D1Database, teamId: string, userId: string): Promise<void> {
	await db.prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?").bind(teamId, userId).run();
}
