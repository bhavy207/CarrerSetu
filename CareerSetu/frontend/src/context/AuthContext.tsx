import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    profileComplete: boolean;
    login: (token: string, username: string, profileComplete?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
    setProfileComplete: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [profileComplete, setProfileCompleteState] = useState<boolean>(
        localStorage.getItem('profileComplete') === 'true'
    );

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

        localStorage.setItem('profileComplete', String(profileComplete));
    }, [token, username, profileComplete]);

    const login = (newToken: string, newUsername: string, newProfileComplete = false) => {
        setToken(newToken);
        setUsername(newUsername);
        setProfileCompleteState(newProfileComplete);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        setProfileCompleteState(false);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profileComplete');
    };

    const setProfileComplete = (val: boolean) => {
        setProfileCompleteState(val);
    };

    return (
        <AuthContext.Provider value={{
            token,
            username,
            profileComplete,
            login,
            logout,
            isAuthenticated: !!token,
            setProfileComplete,
        }}>
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
