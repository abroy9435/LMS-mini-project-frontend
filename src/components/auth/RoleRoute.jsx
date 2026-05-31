import { Navigate } from "react-router-dom";
import { useAppAuth } from "../../context/AuthContext";
import { ROLE_IDS } from "../../utils/constants";

export default function RoleRoute({ children, allowedRoles }) {
  const { dbUser, isLoadingProfile } = useAppAuth();

  if (isLoadingProfile) return <div>Loading access rights...</div>;

  let currentRole = "EMPLOYEE";

  if (dbUser?.RoleID === ROLE_IDS.ADMIN) {
    currentRole = "ADMIN";
  } else if ([ROLE_IDS.REGISTRAR, ROLE_IDS.COE, ROLE_IDS.HOD].includes(dbUser?.RoleID)) {
    currentRole = "APPROVER";
  }

  // If their role isn't in the allowed list, kick them back to the dashboard
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, let them see the page
  return children;
}