"use client";

import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  getLostItems,
  getFoundItems,
  getActivity,
  getMatches,
  getStats,
  getUserProfile,
  updateMatch,
  addActivity,
} from "@/lib/data-store";
import type {
  LostItemReport,
  FoundItemReport,
  Activity,
  Match,
  UserProfile,
} from "@/lib/data-store";
import { useAccount, useWriteContract } from "wagmi";
import { LOSTCHAIN_CONTRACT_ADDRESS, LOSTCHAIN_ABI } from "@/lib/web3";
import { ProfileDialog } from "@/components/ui/auth-dialog";
import { User, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    itemsFound: 0,
    itemsLost: 0,
    activeMatches: 0,
    rewardsEarned: "0.000",
    rewardsPaid: "0.000",
  });
  const [foundReports, setFoundReports] = useState<FoundItemReport[]>([]);
  const [lostReports, setLostReports] = useState<LostItemReport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const { address, isConnected } = useAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmExchange = async (match: Match) => {
    try {
      setConfirmingId(match.id);
      if (match.contractMatchId) {
        await writeContractAsync({
          address: LOSTCHAIN_CONTRACT_ADDRESS,
          abi: LOSTCHAIN_ABI,
          functionName: "confirmExchange",
          args: [BigInt(match.contractMatchId)],
        });
      }
      updateMatch(match.id, { status: "confirmed" }, address);
      addActivity(
        {
          type: "confirmation",
          message: `Confirmed exchange for ${match.itemName}. Reward released on-chain!`,
        },
        address
      );
      if (address) {
        const currentMatches = getMatches(address);
        setMatches(currentMatches);
        setStats(getStats(address));
        setActivity(getActivity(address));
      }
    } catch (err: any) {
      console.error("Confirm exchange error:", err);
      alert(err.message || "Failed to confirm exchange on-chain.");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    if (address) {
      const currentMatches = getMatches(address);
      setMatches(currentMatches);
      setStats(getStats(address));
      setFoundReports(getFoundItems(address));
      setLostReports(getLostItems(address));
      setActivity(getActivity(address));
      setUserProfile(getUserProfile(address));
    }
  }, [address]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      matched: "bg-[#FB3640]/15 text-[#FB3640] border-[#FB3640]/40 shadow-[0_0_12px_rgba(251,54,64,0.3)]",
      confirmed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
      pending_confirmation: "bg-[#FB3640]/20 text-[#FB3640] border-[#FB3640]/50 shadow-[0_0_15px_rgba(251,54,64,0.4)]",
    };
    const labels = {
      pending: "Pending",
      matched: "Matched",
      confirmed: "Confirmed & Returned",
      pending_confirmation: "Match Found - Action Required",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${
          styles[status as keyof typeof styles] || "border-white/10 text-gray-300"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      match: "🎯",
      report: "📝",
      confirmation: "✅",
      reward: "💰",
    };
    return icons[type as keyof typeof icons] || "📌";
  };

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
            className="text-sm font-medium text-[#FB3640] transition-colors"
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

      {/* Dashboard Main View */}
      <section className="max-w-7xl mx-auto mt-10 px-8 pb-16 w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs tracking-wider uppercase text-gray-400 mb-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FB3640]" />
              Personal Ledger & Verification
            </div>
            <h1 className="font-kontras text-5xl md:text-6xl font-bold tracking-tight text-white">
              Command <span className="text-gradient-coral italic font-normal">Center</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <Link href="/find">
              <Button className="btn-imperial rounded-xl text-sm font-medium flex items-center gap-2">
                Report Lost Item
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/report">
              <Button className="btn-glass rounded-xl text-sm font-medium">
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Statistics Liquid Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium block mb-2">
              Items Found
            </span>
            <div className="font-kontras text-4xl font-bold text-white">
              {stats.itemsFound}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium block mb-2">
              Items Lost
            </span>
            <div className="font-kontras text-4xl font-bold text-white">
              {stats.itemsLost}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border-[#FB3640]/30 shadow-[0_0_25px_rgba(251,54,64,0.15)]">
            <span className="text-xs uppercase tracking-wider text-[#FB3640] font-medium block mb-2 flex items-center justify-between">
              Active Matches
              {stats.activeMatches > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#FB3640] animate-ping" />
              )}
            </span>
            <div className="font-kontras text-4xl font-bold text-[#FB3640]">
              {stats.activeMatches}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium block mb-2">
              Rewards Earned
            </span>
            <div className="font-kontras text-4xl font-bold text-emerald-400">
              {stats.rewardsEarned}{" "}
              <span className="text-xs font-sans text-gray-400">ETH</span>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-orange-400 font-medium block mb-2">
              Rewards Paid
            </span>
            <div className="font-kontras text-4xl font-bold text-orange-400">
              {stats.rewardsPaid}{" "}
              <span className="text-xs font-sans text-gray-400">ETH</span>
            </div>
          </div>
        </div>

        {/* Liquid Glass Tabs */}
        <Tabs defaultValue="matches" className="space-y-8">
          <TabsList className="glass-panel p-2 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-5 w-full gap-2 shadow-xl">
            <TabsTrigger value="matches" className="w-full">
              Matches {stats.activeMatches > 0 && `(${stats.activeMatches})`}
            </TabsTrigger>
            <TabsTrigger value="lost" className="w-full">
              Lost Items ({lostReports.length})
            </TabsTrigger>
            <TabsTrigger value="found" className="w-full">
              Found Items ({foundReports.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="w-full">
              Activity
            </TabsTrigger>
            <TabsTrigger value="profile" className="w-full">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-kontras text-2xl font-semibold text-white">
                Active Match Candidates
              </h3>
            </div>

            <div className="grid gap-4">
              {matches.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-400 text-xl">
                    🔍
                  </div>
                  <p className="text-gray-300 font-medium">No matches found yet.</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    When a reported found item aligns with your lost item specifications, the cryptographic match will appear here for verification.
                  </p>
                </div>
              ) : (
                matches.map((match) => (
                  <div
                    key={match.id}
                    className="glass-panel glass-panel-hover p-6 rounded-2xl border-[#FB3640]/30 shadow-[0_0_30px_rgba(251,54,64,0.15)] relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-kontras text-3xl font-bold text-white">
                            {match.itemName}
                          </h4>
                          {getStatusBadge(match.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-300 pt-2">
                          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <span className="text-xs text-gray-500 block">Matched On</span>
                            <span className="font-medium text-white">{match.matchDate}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <span className="text-xs text-gray-500 block">Connected Party</span>
                            <span className="font-medium font-mono text-[#FB3640]">{match.otherParty}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <span className="text-xs text-gray-500 block">Escrow Bounty</span>
                            <span className="font-medium text-emerald-400 font-bold">{match.reward} ETH</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {match.status === "pending_confirmation" && (
                          <Button
                            onClick={() => handleConfirmExchange(match)}
                            disabled={confirmingId === match.id}
                            className="btn-imperial px-6 py-6 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(251,54,64,0.4)]"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            {confirmingId === match.id ? "Releasing Bounty..." : "Confirm Exchange & Pay"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Lost Items Tab */}
          <TabsContent value="lost" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-kontras text-2xl font-semibold text-white">
                Your Lost Item Registrations
              </h3>
            </div>

            <div className="grid gap-4">
              {lostReports.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl">
                  <p className="text-gray-400">No lost items registered yet.</p>
                  <Link href="/find" className="text-[#FB3640] hover:underline mt-2 inline-block text-sm">
                    Report a lost item now &rarr;
                  </Link>
                </div>
              ) : (
                lostReports.map((report) => (
                  <div key={report.id} className="glass-panel glass-panel-hover p-6 rounded-2xl">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-kontras text-2xl font-bold text-white">
                            {report.itemType} - {report.brand}
                          </h4>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-300 pt-2">
                          <div>
                            <span className="text-xs text-gray-500 block">Location</span>
                            <span>{report.location}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Color</span>
                            <span>{report.color}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Date Lost</span>
                            <span>{report.dateLost}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Escrow Reward</span>
                            <span className="text-orange-400 font-semibold">{report.rewardAmount} ETH</span>
                          </div>
                        </div>

                        {report.txHash && (
                          <div className="pt-2 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            On-Chain Escrow Tx: <span className="text-gray-300">{report.txHash.slice(0, 20)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Found Items Tab */}
          <TabsContent value="found" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-kontras text-2xl font-semibold text-white">
                Your Found Item Submissions
              </h3>
            </div>

            <div className="grid gap-4">
              {foundReports.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl">
                  <p className="text-gray-400">No found items reported yet.</p>
                  <Link href="/report" className="text-[#FB3640] hover:underline mt-2 inline-block text-sm">
                    Report a found item &rarr;
                  </Link>
                </div>
              ) : (
                foundReports.map((report) => (
                  <div key={report.id} className="glass-panel glass-panel-hover p-6 rounded-2xl">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-kontras text-2xl font-bold text-white">
                            {report.itemType} - {report.brand}
                          </h4>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-300 pt-2">
                          <div>
                            <span className="text-xs text-gray-500 block">Location Found</span>
                            <span>{report.locationFound}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Color</span>
                            <span>{report.color}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Date Found</span>
                            <span>{report.dateFound}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Current Status</span>
                            <span className="text-emerald-400 font-semibold">{report.status}</span>
                          </div>
                        </div>

                        {report.txHash && (
                          <div className="pt-2 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            On-Chain Tx: <span className="text-gray-300">{report.txHash.slice(0, 20)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <h3 className="font-kontras text-2xl font-semibold text-white mb-2">
              Blockchain Activity Ledger
            </h3>

            <div className="glass-panel p-6 rounded-2xl">
              {activity.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-b-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xl shrink-0">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <h3 className="font-kontras text-2xl font-semibold text-white mb-2">
              Identity Profile
            </h3>

            {userProfile ? (
              <div className="glass-panel p-8 rounded-2xl space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                      Full Name
                    </span>
                    <span className="font-kontras text-2xl font-semibold text-white">
                      {userProfile.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                      Phone Number
                    </span>
                    <span className="text-base text-gray-200 font-mono">
                      {userProfile.phoneNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                      Email
                    </span>
                    <span className="text-base text-gray-200">
                      {userProfile.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                      Connected Wallet
                    </span>
                    <span className="text-xs font-mono text-[#FB3640] break-all">
                      {userProfile.walletAddress}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button
                    onClick={() => setShowProfileDialog(true)}
                    variant="outline"
                    className="btn-glass rounded-xl text-sm"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl text-center">
                <p className="text-gray-400 mb-4">No profile completed yet.</p>
                <Button
                  onClick={() => setShowProfileDialog(true)}
                  className="btn-imperial rounded-xl text-sm"
                >
                  Create Profile
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileComplete={() => {
          if (address) {
            setUserProfile(getUserProfile(address));
          }
        }}
      />
    </main>
  );
}
