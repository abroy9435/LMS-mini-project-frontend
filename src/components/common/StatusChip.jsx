export default function StatusChip({ status }) {
    const styles = {
      APPROVED: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      REJECTED: "bg-red-100 text-red-700",
    };
  
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  }