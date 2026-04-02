import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface ProfileData {
    _id?: string;
    full_name: string;
    age: number | null;
    preferred_language: string;
    academic_info: {
        highest_qualification: string;
        background_stream: string;
        institution: string;
        year_of_completion?: number;
    };
    career_aspirations: {
        target_role: string;
        preferred_industry: string;
        preferred_location: string;
    };
    nsqf_level?: number;
    skills: {
        technical_skills: string[];
        soft_skills: string[];
        certifications: string[];
    };
}

interface AuthContextType {
    token: string | null;
    username: string | null;
    profileComplete: boolean;
    profileData: ProfileData | null;
    role: string | null;
    isAdmin: boolean;
    login: (token: string, username: string, profileComplete?: boolean, role?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    setProfileComplete: (val: boolean) => void;
    setProfileData: (data: ProfileData | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [profileComplete, setProfileCompleteState] = useState<boolean>(
        localStorage.getItem('profileComplete') === 'true'
    );
    const [profileData, setProfileDataState] = useState<ProfileData | null>(() => {
        const stored = localStorage.getItem('profileData');
        return stored ? JSON.parse(stored) : null;
    });

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

        if (role) {
            localStorage.setItem('role', role);
        } else {
            localStorage.removeItem('role');
        }

        localStorage.setItem('profileComplete', String(profileComplete));

        if (profileData) {
            localStorage.setItem('profileData', JSON.stringify(profileData));
        } else {
            localStorage.removeItem('profileData');
        }
    }, [token, username, role, profileComplete, profileData]);

    const login = (newToken: string, newUsername: string, newProfileComplete = false, newRole = 'user') => {
        setToken(newToken);
        setUsername(newUsername);
        setProfileCompleteState(newProfileComplete);
        setRole(newRole);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        setRole(null);
        setProfileCompleteState(false);
        setProfileDataState(null);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profileComplete');
        localStorage.removeItem('role');
        localStorage.removeItem('profileData');
    };

    const setProfileComplete = (val: boolean) => {
        setProfileCompleteState(val);
    };

    const setProfileData = (data: ProfileData | null) => {
        setProfileDataState(data);
    };

    return (
        <AuthContext.Provider value={{
            token,
            username,
            profileComplete,
            profileData,
            role,
            isAdmin: role === 'admin',
            login,
            logout,
            isAuthenticated: !!token,
            setProfileComplete,
            setProfileData,
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
