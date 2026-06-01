export default function Loader({ message = "Loading...", fullScreen = false }) {
  const loaderContent = (
    <div className="flex flex-col space-y-3 w-full h-[80vh] items-center justify-center">
      
      {/* Themed TU LMS Spinner */}
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Background Ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        {/* Center Icon */}
        <span className="material-symbols-outlined text-primary text-[28px] animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>
          school
        </span>
      </div>
      
      {/* Themed Text */}
      <p className="text-primary font-label-md tracking-widest uppercase animate-pulse">
        {message}
      </p>
      
    </div>
  );

  // Use this ONLY for total app initialization (e.g., checking auth state before routing)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  // STANDARD TAB LOADER: Fills the content area naturally without overlapping the sidebar
  return (
    <div className="flex w-full min-h-[50vh] items-center justify-center rounded-xl">
      {loaderContent}
    </div>
  );
}