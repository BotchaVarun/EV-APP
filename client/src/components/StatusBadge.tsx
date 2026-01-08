import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'saved':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interview':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center",
      getStatusStyles(status),
      className
    )}>
      {status}
    </span>
  );
}
