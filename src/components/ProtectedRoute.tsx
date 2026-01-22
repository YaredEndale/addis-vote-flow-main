
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

// TODO: data - Replace with actual admin emails or fetch from database
const ADMIN_EMAILS = [
    "admin@addisgamesweek.com",
    "info@addisgamesweek.com",
    "yaredpay@gmail.com"
];

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // Redirect to login page with return url
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }


    if (requireAdmin && user.email) {
        // Debugging logs
        console.log("Current user:", user.email);
        console.log("Allowed admins:", ADMIN_EMAILS);

        const userEmail = user.email.toLowerCase();
        const allowedEmails = ADMIN_EMAILS.map(e => e.toLowerCase());

        if (!allowedEmails.includes(userEmail)) {
            console.log("Access denied. User not in admin list.");
            // Redirect to home if user is not admin
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
