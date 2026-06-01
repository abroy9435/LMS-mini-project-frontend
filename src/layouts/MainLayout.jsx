import TopAppBar from '../components/layout/TopAppBar';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import ProfileSetup from '../pages/ProfileSetup'; // Import your new page
import { useAppAuth } from '../context/AuthContext'; 

export default function MainLayout({ children }) {
  const { dbUser, isLoadingProfile } = useAppAuth();

  // Wait until we know who they are in the database
  if (isLoadingProfile) {
    return <div className="h-screen flex items-center justify-center bg-surface-container-lowest text-on-surface-variant font-bold animate-pulse">Loading Profile...</div>;
  }

  // THE GATEKEEPER: If they are logged in but missing an Employee ID, force setup!
  // Note: Check the exact casing of EmployeeID based on your auth.go GetMe response
  if (dbUser && (!dbUser.EmployeeID || dbUser.EmployeeID.trim() === "")) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopAppBar />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex justify-center w-full">
          <main className="w-full max-w-[1440px] p-6 md:p-8 pb-24 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}