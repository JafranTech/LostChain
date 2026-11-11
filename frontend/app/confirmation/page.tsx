"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const isFind = type === "find";

  return (
    <main className="min-h-screen bg-[#000F08] text-white flex flex-col relative selection:bg-[#FB3640] selection:text-white">
      {/* Liquid Glass Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-white/10 bg-[#000F08]/75 backdrop-blur-xl sticky top-0 z-50">
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
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors"
          >
            Find Item
          </Link>
          <Link
            href="/report"
            className="text-sm font-medium text-gray-300 hover:text-[#FB3640] transition-colors"
          >
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
          <ConnectButton />
        </nav>
      </header>

      {/* Confirmation Section */}
      <section className="max-w-3xl mx-auto mt-16 px-6 pb-20 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-6 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-kontras text-5xl md:text-6xl font-bold tracking-tight mb-4 text-white">
            {isFind ? "Report Registered in Escrow" : "Found Item Submitted"}
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto font-light">
            {isFind
              ? "Your lost item specification and bounty have been securely committed to the blockchain."
              : "Thank you for being an honest finder! You will be notified the instant a claim matches."}
          </p>
        </div>

        {/* What Happens Next Card */}
        <div className="glass-panel p-8 rounded-3xl mb-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <h2 className="font-kontras text-2xl font-bold text-white mb-6 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#FB3640]" />
            What Happens Next?
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="font-kontras text-2xl font-bold text-[#FB3640] w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="font-semibold text-white mb-1">Cryptographic Match</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The protocol automatically searches for opposite-type reports with matching hashes across the blockchain.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-kontras text-2xl font-bold text-[#FB3640] w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="font-semibold text-white mb-1">Dashboard Alert</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Both parties receive an active match notification on their personal Command Center with contact details for meetup.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-kontras text-2xl font-bold text-[#FB3640] w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="font-semibold text-white mb-1">Physical Handover & Bounty Release</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Ownership is verified in person. When the owner confirms exchange, the smart contract automatically transfers the reward directly to the finder!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="btn-imperial px-8 py-6 rounded-xl text-base font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(251,54,64,0.35)]">
              Go to Command Center
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="btn-glass px-8 py-6 rounded-xl text-base font-semibold">
              Return Home
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000F08] text-white flex items-center justify-center">
          <p className="font-kontras text-2xl text-gray-400">Loading receipt...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
