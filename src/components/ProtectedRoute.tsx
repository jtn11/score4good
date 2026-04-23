"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Only render children if user exists
  if (!user) {
    return null;
  }

  // Very basic admin check
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAdmin = user.email === "admin@score4good.com"; // Hardcoded for MVP

  if (isAdminRoute && !isAdmin) {
    router.push("/dashboard");
    return null;
  }

  return <>{children}</>;
}
