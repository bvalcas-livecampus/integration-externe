import {createContext, useEffect, useState} from 'react';
import api from "../helper/api.ts";
import {useNavigate} from "react-router-dom";

interface AuthContextType {
    isConnected: boolean;
    identifier: string;
    updateIdentifier: (identifier: string) => void;
    login: (identifier: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isConnected: false,
    identifier: '',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login: (identifier: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateIdentifier: (identifier: string) => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [identifier, setIdentifier] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        // On vérifie si un utilisateur est déjà connecté
        if (token) {
            api("POST", "verify")
                .then(() => {})
                .catch(error => {
                    // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                    logout()
                    localStorage.removeItem('token')
                    console.error(error);
                })
        } else {
            logout()
        }
    }, []);

    const login = (identifier: string) => {
        setIsConnected(true);
        setIdentifier(identifier);
    };

    const logout = () => {
        setIsConnected(false);
        setIdentifier('');
    };

    const authContextValue: AuthContextType = {
        isConnected,
        identifier,
        updateIdentifier: setIdentifier,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
