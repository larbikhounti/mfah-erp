import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");

    if (token && email && name) {
      setUser({ email, name });
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success("Logged out successfully", {
      description: "You have been logged out of your account.",
    });
  };

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    getToken,
  };
}
