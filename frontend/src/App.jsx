import React from 'react';
import NumberGuessingGame from './NumberGuessingGame';
import { AuthProvider, useAuth } from './AuthContext';

const GameWrapper = () => {
    const { isAuthenticated, login, logout, principal } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-game-bg">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl mb-4">Welcome to Number Guessing Game</h1>
                    <button
                        onClick={login}
                        className="bg-game-primary text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Login with Internet Identity
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700">Logged in as: {principal?.toText().slice(0, 10)}...</span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <NumberGuessingGame />
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <GameWrapper />
        </AuthProvider>
    );
};

export default App;