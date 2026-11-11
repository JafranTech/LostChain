"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserProfile, getUserProfile, updateUserProfile } from "@/lib/data-store";
import { useAccount } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileComplete?: () => void;
}

export function ProfileDialog({ open, onOpenChange, onProfileComplete }: ProfileDialogProps) {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    university: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && address) {
      const profile = getUserProfile(address);
      if (profile) {
        setFormData({
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          university: profile.university || "",
        });
      }
    }
  }, [open, address]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (formData.phoneNumber.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const existingProfile = getUserProfile(address);
      
      if (existingProfile) {
        updateUserProfile(address, {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          university: formData.university,
        });
      } else {
        createUserProfile({
          walletAddress: address,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          university: formData.university,
        });
      }

      onOpenChange(false);
      onProfileComplete?.();
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-panel bg-[#000F08]/95 border-white/15 text-white p-8 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-kontras text-3xl font-bold text-center text-white">
            Identity Profile
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 text-sm">
            Contact information for coordinating physical handovers and verification
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert className="border-[#FB3640]/40 bg-[#FB3640]/10 text-red-300 rounded-xl">
            <AlertCircle className="h-4 w-4 text-[#FB3640]" />
            <AlertDescription className="text-red-200 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs uppercase tracking-wider font-medium text-gray-300">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. Alice Chen"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="glass-input h-12 rounded-xl text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider font-medium text-gray-300">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="alice@campus.edu"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="glass-input h-12 rounded-xl text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-xs uppercase tracking-wider font-medium text-gray-300">
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="glass-input h-12 rounded-xl text-white"
              required
            />
            <p className="text-xs text-gray-500">
              Used strictly for in-person meetup verification.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="university" className="text-xs uppercase tracking-wider font-medium text-gray-300">
              Campus / Organization
            </Label>
            <Input
              id="university"
              type="text"
              placeholder="e.g. Central University"
              value={formData.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
              className="glass-input h-12 rounded-xl text-white"
            />
          </div>
          
          <Button
            type="submit"
            className="btn-imperial w-full py-6 text-base font-semibold rounded-xl mt-6 shadow-[0_0_20px_rgba(251,54,64,0.35)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Profile..." : "Save Identity Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
