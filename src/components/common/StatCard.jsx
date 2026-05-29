export default function StatCard({ title, value, subtitle, icon, theme = 'primary' }) {
    // Map our Academic Flux themes to Tailwind classes
    const themeStyles = {
      primary: { bg: 'bg-primary-fixed', text: 'text-primary', borderHover: 'hover:border-primary' },
      tertiary: { bg: 'bg-tertiary-fixed', text: 'text-tertiary', borderHover: 'hover:border-tertiary' },
      secondary: { bg: 'bg-secondary-fixed', text: 'text-secondary', borderHover: 'hover:border-secondary' },
    };
  
    const active = themeStyles[theme] || themeStyles.primary;
  
    return (
      <div className={`bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between h-48 group ${active.borderHover} transition-colors cursor-default shadow-sm`}>
        <div className="flex justify-between items-start">
          <span className={`material-symbols-outlined p-2 ${active.bg} ${active.text} rounded-full`}>
            {icon}
          </span>
          <span className="text-label-md font-label-md text-on-surface-variant opacity-60 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div>
          <div className={`text-[48px] font-bold ${active.text} leading-none`}>
            {value}
          </div>
          <p className="text-on-surface-variant font-label-md mt-2">
            {subtitle}
          </p>
        </div>
      </div>
    );
  }