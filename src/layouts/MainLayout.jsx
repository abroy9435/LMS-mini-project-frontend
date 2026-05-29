import TopAppBar from '../components/layout/TopAppBar';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';

export default function MainLayout({ children }) {
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

      {/* 5. Mobile Nav only shows on small screens */}
      <MobileNav />
    </div>
  );
}