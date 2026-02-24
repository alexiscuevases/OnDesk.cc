import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface AuthContextValue {
	user: AuthUser | null;
	isAuthenticated: boolean;
	setUser: (user: AuthUser | null) => void;
	clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode;
	initialUser: AuthUser | null;
}) {
	const [user, setUserState] = useState<AuthUser | null>(initialUser);

	const setUser = useCallback((u: AuthUser | null) => setUserState(u), []);
	const clearUser = useCallback(() => setUserState(null), []);

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: user !== null, setUser, clearUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
