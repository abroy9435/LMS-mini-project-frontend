import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../utils/apiAdapters';
import { ENDPOINTS } from '../utils/constants';

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
          const token = await getToken();
          // Inject token globally for all future Axios requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch the user's Tezpur University profile from Go backend
          const response = await api.get(ENDPOINTS.ME);
          setDbUser(response.data.user);
        } catch (error) {
          console.error("Database profile not found or error:", error);
          // If 404, it means they are logged into Clerk but not in our DB.
          setDbUser(null); 
        }
      } else {
        setDbUser(null);
        delete api.defaults.headers.common['Authorization'];
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