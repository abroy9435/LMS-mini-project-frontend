import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiFetch } from '../utils/apiAdapters'; // Use our new fetch wrapper
import { API_URLS } from '../utils/constants'; // Import the new nested URLs

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { getToken, isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [dbUser, setDbUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const syncProfile = async () => {
      if (isSignedIn) {
        try {
          // Fetch the user's Tezpur University profile from Go backend
          // We pass the URL, GET options, and the getToken function down to apiFetch
          const response = await apiFetch(
            API_URLS.user.me, 
            { method: 'GET' }, 
            getToken
          );
          
          setDbUser(response.user || response); // Adjust based on how your Go backend wraps the JSON
        } catch (error) {
          console.error("Database profile not found or error:", error);
          // If 404, it means they are logged into Clerk but not in our DB yet.
          setDbUser(null); 
        }
      } else {
        setDbUser(null);
      }
      setIsLoadingProfile(false);
    };

    if (isClerkLoaded) {
      syncProfile();
    }
  }, [isClerkLoaded, isSignedIn, getToken]);

  return (
    <AuthContext.Provider value={{ dbUser, isLoadingProfile, clerkUser, isClerkLoaded, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);