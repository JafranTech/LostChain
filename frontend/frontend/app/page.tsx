"use client";

import Link from "next/link";
import { ProfileDialog } from "@/components/ui/auth-dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { isProfileComplete } from "@/lib/data-store";
import { AuthButton } from "@/components/auth-button";
import { motion } from "framer-motion";
import { Shield, Sparkles, Lock, ArrowRight, Search, PlusCircle } from "lucide-react";

export default function LandingPage() {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { address, isConnected } = useAccount();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (address) {
      setHasProfile(isProfileComplete(address));
    }
  }, [address]);

  return (
    <main className="min-h-screen bg-[#000F08] text-white flex flex-col relative selection:bg-[#FB3640] selection:text-white">
      {/* Liquid Glass Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-white/10 bg-[#000F08]/70 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FB3640] to-[#991B1B] flex items-center justify-center shadow-[0_0_15px_rgba(251,54,64,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-kontras text-3xl font-semibold tracking-tight text-white group-hover:text-[#FB3640] transition-colors">
            Lost<span className="text-[#FB3640]">Chain</span>
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/find"
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-[#FB3640]" />
            Find Item
          </Link>
          <Link
            href="/report"
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#FB3640]" />
            Report Item
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors"
          >
            About
          </Link>
          <AuthButton />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-20 lg:mt-28 px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs tracking-wider uppercase text-gray-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FB3640] animate-pulse" />
            Decentralized Lost & Found Protocol
          </div>

          <h1 className="font-kontras text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] text-white">
            Lost Something <br />
            <span className="text-gradient-coral italic font-normal">on Campus?</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl font-light mt-6 max-w-xl leading-relaxed">
            LostChain protects your item privacy with cryptographic hashes and locks
            finder rewards into automated smart contract escrow. Zero fraud, instant verification.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            {!isConnected ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400">Connect your Web3 wallet to begin</p>
                <AuthButton />
              </div>
            ) : !hasProfile ? (
              <Button
                size="lg"
                onClick={() => setShowProfileDialog(true)}
                className="btn-imperial px-8 py-6 text-base font-medium rounded-xl flex items-center gap-2"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Link href="/find">
                  <Button
                    size="lg"
                    className="btn-imperial px-8 py-6 text-base font-medium rounded-xl flex items-center gap-2"
                  >
                    Report Lost Item
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/report">
                  <Button
                    size="lg"
                    variant="outline"
                    className="btn-glass px-8 py-6 text-base font-medium rounded-xl hover:text-white"
                  >
                    Report Found Item
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Hero Interactive Liquid Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative glass-panel rounded-3xl p-8 overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#FB3640]/25 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FB3640]" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs text-gray-400 font-mono tracking-wider">SMART CONTRACT ESCROW</span>
            </div>

            <div className="py-8 space-y-6">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Cryptographic Proof</span>
                  <span className="text-[#FB3640] font-mono">keccak256</span>
                </div>
                <div className="text-xs font-mono text-gray-300 break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f...
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs text-gray-400 block mb-1">Escrow Protocol</span>
                  <span className="font-kontras text-2xl font-bold text-white">Trustless</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs text-gray-400 block mb-1">Finder Payout</span>
                  <span className="font-kontras text-2xl font-bold text-[#FB3640]">Automated</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Verified On-Chain</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Network Active (31337)
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Glass Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-28 px-8 max-w-7xl mx-auto mb-28 w-full">
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-kontras text-2xl font-semibold text-white mb-3">
            Privacy Preserved
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Item details never sit in plain text on-chain. Cryptographic commitment hashes
            ensure only true owners can prove their claim.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-kontras text-2xl font-semibold text-white mb-3">
            Instant Rewards
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            The smart contract automatically holds ETH bounties in escrow and pays the honest
            finder immediately upon physical handover confirmation.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-kontras text-2xl font-semibold text-white mb-3">
            Fraud-Resistant
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nobody can fake ownership or front-run claims. The cryptographic salt and challenge
            scheme protect your belongings from fraudsters.
          </p>
        </div>
      </section>

      {/* Liquid Glass Footer */}
      <footer className="py-8 px-8 border-t border-white/10 bg-[#000F08]/80 backdrop-blur-xl mt-auto text-center text-xs text-gray-500 font-light flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="font-kontras text-lg text-white">
          Lost<span className="text-[#FB3640]">Chain</span> Protocol
        </span>
        <span>&copy; 2026 LostChain. Empowered by Ethereum Smart Contracts.</span>
      </footer>

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={() => {
          setHasProfile(true);
          setShowProfileDialog(false);
        }}
      />
    </main>
  );
}
