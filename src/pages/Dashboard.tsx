import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import FeedbackDashboard from "@/components/FeedbackDashboard";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-glass-gradient bg-glass-radial">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-gradient-to-br from-[oklch(0.6_0.12_200/0.08)] to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-gradient-to-tr from-[oklch(0.5_0.16_265/0.06)] to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="glass rounded-2xl px-5 py-4 mb-6 flex items-center justify-between glass-edge">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.55_0.12_265/0.1)]">
              <BarChart3 className="size-5 text-[#4f6ef7]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                Feedback Analyzer
              </h1>
              <p className="text-xs text-muted-foreground/60">
                {user?.email || "Signed in"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer gap-2 bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80"
            onClick={handleSignOut}
            size="sm"
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>

        {/* Main dashboard content */}
        <FeedbackDashboard />
      </div>
    </main>
  );
}
