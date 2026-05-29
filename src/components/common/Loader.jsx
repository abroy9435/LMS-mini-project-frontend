export default function Loader({ message = "Loading...", fullScreen = false }) {
    const loaderContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium animate-pulse">{message}</p>
      </div>
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          {loaderContent}
        </div>
      );
    }
  
    return loaderContent;
  }