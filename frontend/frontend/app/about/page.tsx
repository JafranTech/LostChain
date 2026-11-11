"use client";

import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Lock, Zap, ArrowRight } from "lucide-react";

export default function AboutPage() {
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
            className="text-sm font-medium text-[#FB3640] transition-colors"
          >
            About
          </Link>
          <AuthButton />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-8 max-w-5xl mx-auto text-center w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs tracking-wider uppercase text-gray-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#FB3640] animate-pulse" />
          The Philosophy Behind LostChain
        </div>
        <h1 className="font-kontras text-6xl md:text-8xl font-bold tracking-tight text-white mb-6">
          Architected for <br />
          <span className="text-gradient-coral italic font-normal">Trust & Privacy</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto">
          A decentralized protocol designed to reunite individuals with their belongings through
          cryptographic commitments, smart contract escrow, and fraud-resistant verification.
        </p>
      </section>

      {/* Core Values Liquid Glass Grid */}
      <section className="max-w-7xl mx-auto px-8 py-12 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-kontras text-2xl font-bold text-white mb-3">
              Privacy First
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cryptographic hashing guarantees your private serial numbers, stickers, and distinctive
              identifiers remain undisclosed until physical verification.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-kontras text-2xl font-bold text-white mb-3">
              Trustless Escrow
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Smart contracts eliminate the middleman. Funds are locked in an autonomous digital
              safe that releases only upon mutual confirmation.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FB3640]/15 border border-[#FB3640]/30 flex items-center justify-center mb-6 text-[#FB3640]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-kontras text-2xl font-bold text-white mb-3">
              Incentivized Honesty
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Finders receive immediate on-chain cryptocurrency rewards directly to their wallet,
              cultivating an honest campus community.
            </p>
          </div>
        </div>
      </section>

      {/* 4 Step Architecture Flow */}
      <section className="max-w-6xl mx-auto py-20 px-8 w-full">
        <h2 className="font-kontras text-4xl md:text-5xl font-bold text-center text-white mb-16">
          The 4-Step <span className="text-gradient-coral italic font-normal">Lifecycle</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl flex items-start gap-5">
            <span className="font-kontras text-4xl font-bold text-[#FB3640] shrink-0">01</span>
            <div>
              <h4 className="font-kontras text-2xl font-bold text-white mb-2">Registration</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                The owner submits their lost item details along with a cryptocurrency reward deposited into escrow.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex items-start gap-5">
            <span className="font-kontras text-4xl font-bold text-[#FB3640] shrink-0">02</span>
            <div>
              <h4 className="font-kontras text-2xl font-bold text-white mb-2">Finder Report</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                A finder logs general attributes of the item found. The attributes are cryptographically commitment-hashed.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex items-start gap-5">
            <span className="font-kontras text-4xl font-bold text-[#FB3640] shrink-0">03</span>
            <div>
              <h4 className="font-kontras text-2xl font-bold text-white mb-2">Automated Match</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                The protocol identifies matching records based on standardized properties, alerting both participants.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex items-start gap-5">
            <span className="font-kontras text-4xl font-bold text-[#FB3640] shrink-0">04</span>
            <div>
              <h4 className="font-kontras text-2xl font-bold text-white mb-2">Handover & Release</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ownership is verified in person. The owner approves the return, instantly releasing the escrowed reward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto py-16 px-8 text-center w-full">
        <div className="glass-panel p-12 rounded-3xl border-[#FB3640]/30 shadow-[0_0_50px_rgba(251,54,64,0.15)] relative overflow-hidden">
          <h3 className="font-kontras text-4xl font-bold text-white mb-4">
            Experience the Future of Lost & Found
          </h3>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
            Built on Ethereum smart contracts. Secure your valuable belongings with decentralized cryptography today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/find">
              <Button className="btn-imperial px-8 py-6 rounded-xl text-base font-semibold flex items-center gap-2">
                Report Lost Item
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/report">
              <Button className="btn-glass px-8 py-6 rounded-xl text-base font-semibold">
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-white/10 bg-[#000F08]/80 backdrop-blur-xl mt-auto text-center text-xs text-gray-500 font-light flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="font-kontras text-lg text-white">
          Lost<span className="text-[#FB3640]">Chain</span> Protocol
        </span>
        <span>&copy; 2026 LostChain. Empowered by Ethereum Smart Contracts.</span>
      </footer>
    </main>
  );
}
