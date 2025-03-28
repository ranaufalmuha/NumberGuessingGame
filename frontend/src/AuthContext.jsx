import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from 'declarations/backend'; // Import your backend's IDL
import { canisterId } from 'declarations/backend'; // Import the canister ID

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authClient, setAuthClient] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [principal, setPrincipal] = useState(null);
    const [authActor, setAuthActor] = useState(null);

    useEffect(() => {
        const initAuthClient = async () => {
            const client = await AuthClient.create();
            setAuthClient(client);

            // Check if already authenticated
            const isLoggedIn = await client.isAuthenticated();
            if (isLoggedIn) {
                const identity = client.getIdentity();
                setPrincipal(identity.getPrincipal());
                setIsAuthenticated(true);
                
                // Create actor when already authenticated
                const agent = new HttpAgent({ identity });
                const actor = Actor.createActor(idlFactory, { agent, canisterId });
                setAuthActor(actor);
            }
        };

        initAuthClient();
    }, []);

    const login = async () => {
        if (!authClient) return;

        await new Promise((resolve) => {
            authClient.login({
                identityProvider: 'https://identity.ic0.app',
                onSuccess: () => {
                    const identity = authClient.getIdentity();
                    setPrincipal(identity.getPrincipal());
                    setIsAuthenticated(true);
                    
                    // Properly create actor
                    const agent = new HttpAgent({ identity });
                    const actor = Actor.createActor(idlFactory, { agent, canisterId });
                    setAuthActor(actor);
                    
                    resolve();
                },
                onError: (error) => {
                    console.error('Login failed', error);
                    resolve();
                }
            });
        });
    };

    const logout = async () => {
        if (authClient) {
            await authClient.logout();
            setIsAuthenticated(false);
            setPrincipal(null);
            setAuthActor(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                principal,
                authActor,
                login,
                logout,
                authClient
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};