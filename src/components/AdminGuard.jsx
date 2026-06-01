import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

export default function AdminGuard({ children }) {
    const { getToken } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper to get the correct backend URL
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860';

    // ==========================================
    // UNLOCK (Authentication)
    // ==========================================
    const handleUnlock = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const token = await getToken();
            
            // 1. Get the login challenge from Go
            const beginRes = await fetch(`${API_BASE}/api/v1/auth/webauthn/login/begin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (beginRes.status === 400) {
                // Backend says "No biometric credentials registered"
                setError("No passkey found on this account. Please register your device first.");
                setIsLoading(false);
                return;
            }

            const options = await beginRes.json();
            console.log("WebAuthn Login Options:", options);

            // The Go library wraps the configuration inside a 'publicKey' field
            const authenticationOptions = options.publicKey ? options.publicKey : options;

            // 2. Trigger the Phone/Browser Biometric Prompt
            const asseResp = await startAuthentication(authenticationOptions);
            const freshToken = await getToken();
            // 3. Send the cryptographic signature back to Go
            const finishRes = await fetch(`${API_BASE}/api/v1/auth/webauthn/login/finish`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`
                },
                body: JSON.stringify(asseResp),
            });

            if (finishRes.ok) {
                setIsUnlocked(true);
                // Tip: You could set a setTimeout here to set isUnlocked(false) after 15 minutes!
            } else {
                setError("Verification failed. Please try again.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Biometric prompt cancelled or failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // REGISTER (First-time setup)
    // ==========================================
    const handleRegister = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const token = await getToken();
            
            // 1. Get the registration challenge from Go
            const beginRes = await fetch(`${API_BASE}/api/v1/auth/webauthn/register/begin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const options = await beginRes.json();
            console.log("WebAuthn Registration Options:", options);

            // The Go library wraps the configuration inside a 'publicKey' field
            const registrationOptions = options.publicKey ? options.publicKey : options;

            // 2. Trigger the Phone/Browser creation prompt
            const attResp = await startRegistration(registrationOptions);
            const freshToken = await getToken();
            // 3. Send the new Public Key to Go to save in DB
            const finishRes = await fetch(`${API_BASE}/api/v1/auth/webauthn/register/finish`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`
                },
                body: JSON.stringify(attResp),
            });

            if (finishRes.ok) {
                // Once registered, immediately unlock them
                setIsUnlocked(true);
            } else {
                setError("Failed to save passkey to server.");
            }
        } catch (err) {
            console.error("Registration Error:", err);
            setError("Registration cancelled or failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // If unlocked, render the actual Admin Dashboard
    if (isUnlocked) {
        return children;
    }

    // If locked, show the Lock Screen UI
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[600px] bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-sm p-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>fingerprint</span>
            </div>
            
            <h2 className="text-3xl font-bold text-on-surface mb-2">Admin Portal Locked</h2>
            <p className="text-on-surface-variant mb-8 text-center max-w-md">
                This section contains sensitive system settings. Please verify your identity using a registered device or passkey.
            </p>

            {error && (
                <div className="mb-6 p-3 bg-error-container text-error rounded-xl text-sm font-bold w-full max-w-sm text-center">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button 
                    onClick={handleUnlock} 
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined">lock_open</span>
                    {isLoading ? "Waiting for device..." : "Unlock with Biometrics"}
                </button>
                
                <button 
                    onClick={handleRegister} 
                    disabled={isLoading}
                    className="w-full bg-transparent border-2 border-primary text-primary py-3 px-6 rounded-xl font-bold hover:bg-primary/5 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Register New Device
                </button>
            </div>
        </div>
    );
}