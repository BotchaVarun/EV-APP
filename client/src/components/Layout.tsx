import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, loginMutation, logoutMutation, isLoading } = useAuth();
  const logout = () => logoutMutation.mutate();
  const login = () => loginMutation.mutate();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Briefcase, label: "Applications", href: "/applications" },
    { icon: CalendarDays, label: "Calendar", href: "/calendar" },
    { icon: Users, label: "Recruiters", href: "/recruiters" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Briefcase size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job Tracker</h1>
          <p className="text-slate-500 mb-8">Organize your job search, track applications, and land your dream role.</p>
          <Button
            onClick={() => login()}
            disabled={loginMutation.isPending}
            className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Briefcase size={18} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">JobTracker</span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                location === item.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}>
                <item.icon size={20} className={cn(
                  location === item.href ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.firstName || "User"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Users size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => logout()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 w-full justify-start"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
