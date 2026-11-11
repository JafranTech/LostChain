"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { getUserProfile, isProfileComplete } from "./data-store";
import type { UserProfile } from "./data-store";

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = () => {
    if (address) {
      const profile = getUserProfile(address);
      setUserProfile(profile);
      setIsAuthenticated(isConnected && !!profile);
    } else {
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    refreshProfile();
    setIsLoading(false);
  }, [address, isConnected]);

  const login = () => {
    // Login is handled by wallet connection + profile completion
    refreshProfile();
  };

  const logout = () => {
    // Clear authentication state
    setIsAuthenticated(false);
    setUserProfile(null);
    // Note: Wallet disconnection is handled by RainbowKit
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
