import {createContext, PropsWithChildren, useState} from 'react';

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
    login: (_identifier: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateIdentifier: (_identifier: string) => {},
    logout: () => {}
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [isConnected, setIsConnected] = useState(false);
    const [identifier, setIdentifier] = useState('');

    const login = (identifier: string) => {
        setIsConnected(true);
        setIdentifier(identifier);
    };

    const logout = () => {
        setIsConnected(false);
        setIdentifier('');
        localStorage.removeItem('token');
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
