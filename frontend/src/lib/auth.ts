export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    profilePic?: string;
    hasPassword?: boolean;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;
const USER_STORAGE_KEY = 'pojok-foto-user';
const TOKEN_STORAGE_KEY = 'pojok-foto-token';

export const auth = {
    async login(email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        this.setSession(data.token, data.user);
        return data.user;
    },

    async register(name: string, email: string, password: string, username?: string): Promise<User> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        this.setSession(data.token, data.user);
        return data.user;
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    },

    getUser(): User | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },

    setSession(token: string, user: User) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
    },

    async updateUser(updates: Partial<User>) {
        // Note: This would typically require a backend endpoint for profile updates (e.g., PUT /api/user/me)
        // For now, we update local state, but in a real app, this calls the API.
        const user = this.getUser();
        if (user) {
            const updated = { ...user, ...updates };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        }
        return null;
    }
};
