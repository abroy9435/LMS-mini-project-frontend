export default function LeaveBalanceCard({ title, used, total, icon, theme = 'primary' }) {
  // Safe calculation to prevent dividing by zero
  const percentage = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  
  const themeStyles = {
    primary: { iconBg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
    tertiary: { iconBg: 'bg-tertiary/10', text: 'text-tertiary', bar: 'bg-tertiary' },
    secondary: { iconBg: 'bg-secondary/10', text: 'text-secondary', bar: 'bg-secondary' },
  };

  const active = themeStyles[theme];

  return (
    <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`${active.iconBg} p-2 rounded-lg`}>
          <span className={`material-symbols-outlined ${active.text}`}>{icon}</span>
        </div>
        <span className={`font-label-md text-label-md ${active.text} font-bold uppercase`}>
          {title}
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="font-display-lg text-display-lg text-on-surface leading-none">
          {used < 10 ? `0${used}` : used}
        </span>
        <span className="font-body-md text-on-surface-variant mb-1">
          / {total < 10 ? `0${total}` : total} days
        </span>
      </div>
      
      <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
        <div className={`${active.bar} h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="font-label-md text-label-md text-on-surface-variant mt-3">Remaining Balance</p>
    </div>
  );
}