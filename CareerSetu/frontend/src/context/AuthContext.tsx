import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }

        if (username) {
            localStorage.setItem('username', username);
        } else {
            localStorage.removeItem('username');
        }
    }, [token, username]);

    const login = (newToken: string, newUsername: string) => {
        setToken(newToken);
        setUsername(newUsername);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
