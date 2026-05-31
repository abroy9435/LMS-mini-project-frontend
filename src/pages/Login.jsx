import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Headless Clerk authentication for Google
  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  // 2. Wired Clerk Email/Password Authentication
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
   
    try {
      // Use Clerk directly instead of manually hitting the Go backend
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/"); 
      } else {
        console.log("Investigate additional auth steps:", result);
      }
    } catch (error) {
      console.error("Login error:", error.errors ? error.errors[0].message : error.message);
      alert(error.errors ? error.errors[0].message : "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-surface m-0 p-0 overflow-hidden">
      
      {/* LEFT PANEL: Hero & Context (Hidden on mobile) */}
      <section className="hidden md:flex relative w-1/2 h-full flex-col justify-end p-10 lg:p-14 overflow-hidden bg-[#1a132b]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Tezpur University Campus" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a132b]/40 to-[#1a132b]/95"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-white text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
            <span className="font-headline-md text-white font-bold tracking-wide">TU LMS</span>
          </div>
          
          <h1 className="text-[48px] font-bold text-white mb-4 leading-tight tracking-tight">
            Tezpur University LMS
          </h1>
          <p className="text-[18px] text-white/80 mb-12 max-w-md leading-relaxed">
            Your centralized portal for administrative workflows, course management, and faculty resources.
          </p>
          
          <div className="flex gap-8 border-t border-white/20 pt-8">
            <div>
              <div className="text-white text-[24px] font-bold">15k+</div>
              <div className="text-white/60 text-[12px] uppercase tracking-wider mt-1">Students Enrolled</div>
            </div>
            <div className="border-l border-white/20 h-10 self-center"></div>
            <div>
              <div className="text-white text-[24px] font-bold">500+</div>
              <div className="text-white/60 text-[12px] uppercase tracking-wider mt-1">Faculty Members</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <p className="text-[12px] text-white/40">
            © 2024 Tezpur University. All rights reserved.
          </p>
        </div>
      </section>

      {/* RIGHT PANEL: Login Interface */}
      <section className="w-full md:w-1/2 h-full bg-white flex flex-col items-center justify-center p-6 relative">
        
        {/* Top Navigation */}
        <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-12 py-6 w-full">
          <div className="md:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
            <span className="font-headline-md text-primary font-bold">TU LMS</span>
          </div>
          <div className="flex gap-6 items-center ml-auto text-on-surface-variant">
            <motion.button {...motionProps} className="hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">language</span>
              <span className="text-[14px] font-medium hidden sm:inline">English</span>
            </motion.button>
            <motion.button {...motionProps} className="hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="text-[14px] font-medium hidden sm:inline">Support</span>
            </motion.button>
          </div>
        </nav>

        {/* Login Card Container */}
        <div className="w-full max-w-[420px] bg-white rounded-[16px] p-8 md:p-10 flex flex-col border border-outline-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <header className="mb-8">
            <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Welcome back</h2>
            <p className="text-[14px] text-on-surface-variant">Please enter your institutional credentials.</p>
          </header>

          {/* Social Sign In (Headless Clerk) */}
          <motion.button 
            {...motionProps}
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all duration-200 mb-8 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-[15px] font-semibold text-on-surface">Continue with Google</span>
          </motion.button>

          {/* Divider */}
          <div className="flex items-center mb-8">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="px-4 text-[12px] font-medium text-outline uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Fully Wired Form */}
          <form className="flex flex-col gap-5" onSubmit={handleEmailSignIn}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-on-surface-variant ml-1">Institutional Email</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="name@tezu.ac.in" 
                className="h-[44px] px-4 border border-outline-variant rounded-xl bg-white text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[13px] font-semibold text-on-surface-variant">Password</label>
                <motion.a {...motionProps} href="#" className="text-[12px] font-semibold text-primary hover:underline cursor-pointer">Forgot?</motion.a>
              </div>
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••" 
                className="h-[44px] px-4 border border-outline-variant rounded-xl bg-white text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center gap-2 ml-1 mb-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-[13px] text-on-surface-variant cursor-pointer">Keep me signed in</label>
            </div>
            
            <motion.button 
              {...motionProps}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <footer className="mt-10 pt-6 border-t border-outline-variant/50 text-center">
            <p className="text-[13px] text-on-surface-variant mb-2">
              Don't have an account? <motion.a {...motionProps} href="#" className="text-primary font-semibold hover:underline inline-block cursor-pointer">Contact Administrator</motion.a>
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <motion.a {...motionProps} href="#" className="text-outline hover:text-on-surface-variant transition-colors text-[12px] inline-block cursor-pointer">Privacy Policy</motion.a>
              <motion.a {...motionProps} href="#" className="text-outline hover:text-on-surface-variant transition-colors text-[12px] inline-block cursor-pointer">Terms of Service</motion.a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}