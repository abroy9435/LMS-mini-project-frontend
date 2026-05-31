import { Navigate } from "react-router-dom";
import { useAppAuth } from "../../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { dbUser, isLoadingProfile } = useAppAuth();

  if (isLoadingProfile) return <div>Loading access rights...</div>;

  const userLevel = dbUser?.role?.hierarchy_level || 0;

  let currentRole = "EMPLOYEE";
  
  if (userLevel >= 110) {
    currentRole = "VC";       // Distinguish the VC specifically
  } else if (userLevel >= 100) {
    currentRole = "ADMIN";    // Standard System Administrator
  } else if (userLevel >= 50) {
    currentRole = "APPROVER"; // HOD, COE, Registrar
  }

  // If their role isn't in the allowed list, kick them to their appropriate home
  if (!allowedRoles.includes(currentRole)) {
    // Smart fallback: VCs get bounced to the Admin panel, everyone else to the Dashboard
    if (currentRole === "VC") {
       return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}