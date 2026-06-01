import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useAppAuth } from "../context/AuthContext";
import { API_URLS } from "../utils/constants";

export default function ProfileSetup() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { fetchUserProfile } = useAppAuth(); 

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ employee_id: "", department_id: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    async function loadDepartments() {
      try {
        const token = await getToken();
        // Explicitly typed string to avoid 'undefined' appends
        const res = await fetch(`${baseUrl}/api/v1/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDepartments(data.data || []);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    }
    loadDepartments();
  }, [getToken, baseUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      
      const res = await fetch(`${baseUrl}/api/v1/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile details");

      // 1. Try to reload the profile gracefully via context
      if (typeof fetchUserProfile === 'function') {
        await fetchUserProfile(); 
      } 
      
      // 2. BULLETPROOF FALLBACK: Force a hard refresh. 
      // This forces MainLayout to re-fetch GetMe, see your new Employee ID, and drop you in the dashboard.
      window.location.reload();
      
    } catch (err) {
      setError(err.message);
    } finally {
      // 3. CRITICAL FIX: Always stop the spinner, whether success or failure
      setIsProcessing(false); 
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-xl border border-outline-variant"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-container text-primary flex items-center justify-center mb-4 overflow-hidden shadow-sm">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-4xl">person</span>
            )}
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Welcome to the Portal!</h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Let's get your account set up. Please provide your institutional details below.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-error text-sm font-bold p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Read-only Clerk Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Full Name</label>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl text-on-surface font-medium border border-outline-variant/50">
                {user?.fullName || "User"}
              </div>
            </div>
            <div>
              <label className="block text-label-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Email Address</label>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl text-on-surface font-medium border border-outline-variant/50 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/50 my-6" />

          {/* User Input Data */}
          <div>
            <label className="block text-label-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Staff / Employee ID <span className="text-error">*</span>
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. EMP-2026"
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
            />
          </div>

          <div>
            <label className="block text-label-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Department <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select 
                required
                value={formData.department_id}
                onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl p-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface cursor-pointer"
              >
                <option value="" disabled>Select your department...</option>
                {departments.map(dept => (
                  <option key={dept.ID || dept.id} value={dept.ID || dept.id}>{dept.Name || dept.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isProcessing ? (
              <span className="material-symbols-outlined animate-spin">autorenew</span>
            ) : (
              <>Complete Setup <span className="material-symbols-outlined text-sm">arrow_forward</span></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}