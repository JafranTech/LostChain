"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { getUserProfile } from "@/lib/data-store";
import { useState, useEffect } from "react";
import { ProfileDialog } from "@/components/ui/auth-dialog";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (address) {
      setUserProfile(getUserProfile(address));
    } else {
      setUserProfile(null);
    }
  }, [address]);

  const handleLogout = () => {
    disconnect();
    setUserProfile(null);
  };

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className="rainbow-custom-wrapper">
        <ConnectButton />
      </div>
    );
  }

  // Connected but no profile - show complete profile button
  if (!userProfile) {
    return (
      <>
        <Button
          onClick={() => setShowProfileDialog(true)}
          className="btn-imperial rounded-xl text-sm font-semibold px-5 py-2.5 shadow-[0_0_20px_rgba(251,54,64,0.35)]"
        >
          Complete Profile
        </Button>
        <ProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onProfileComplete={() => {
            if (address) {
              setUserProfile(getUserProfile(address));
            }
          }}
        />
      </>
    );
  }

  // Logged in - show user menu
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="btn-glass rounded-xl gap-2.5 px-4 py-2 border-white/20 text-white hover:border-[#FB3640]/50"
          >
            <div className="w-6 h-6 rounded-full bg-[#FB3640]/20 border border-[#FB3640]/40 flex items-center justify-center text-[#FB3640]">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-sm">{userProfile.fullName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 glass-panel bg-[#000F08]/95 border-white/15 text-white p-2 rounded-2xl shadow-2xl"
        >
          <DropdownMenuLabel className="font-kontras text-lg text-white px-3 py-1">
            Account Details
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="px-3 py-2 text-xs font-mono text-gray-400 break-all bg-white/[0.03] rounded-lg my-1">
            {address}
          </div>
          <DropdownMenuItem
            onClick={() => setShowProfileDialog(true)}
            className="rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer px-3 py-2"
          >
            <User className="mr-2 h-4 w-4 text-[#FB3640]" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-lg text-sm text-[#FB3640] hover:text-red-400 hover:bg-[#FB3640]/10 cursor-pointer px-3 py-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={() => {
          if (address) {
            setUserProfile(getUserProfile(address));
          }
        }}
      />
    </>
  );
}
