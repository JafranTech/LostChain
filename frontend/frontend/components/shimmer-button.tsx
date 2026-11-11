"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link";
}

export function ShimmerButton({ 
  children, 
  onClick, 
  className = "",
  size = "default",
  variant = "default"
}: ShimmerButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-block"
    >
      <Button
        onClick={onClick}
        size={size}
        variant={variant}
        className={`relative overflow-hidden ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}
