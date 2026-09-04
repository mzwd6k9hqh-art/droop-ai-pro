import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, MessageSquare, LayoutDashboard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="elevated-card max-w-md w-full p-8 text-center space-y-5">
        <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Compass className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This page does not exist. Here is where you can go next.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1 gradient-button gap-2" onClick={() => navigate("/ai")}>
            <MessageSquare className="h-4 w-4" /> ZYRA
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
