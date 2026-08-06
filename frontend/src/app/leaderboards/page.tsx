'use client';

import React from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Mock data for the leaderboard
const leaderboardData = [
    { rank: 1, name: "Aarav Sharma", score: 98, role: "Student", labsCompleted: 14, time: "12m 30s" },
    { rank: 2, name: "Isha Gupta", score: 95, role: "Student", labsCompleted: 12, time: "14m 10s" },
    { rank: 3, name: "Rahul Verma", score: 92, role: "Student", labsCompleted: 11, time: "15m 45s" },
    { rank: 4, name: "Sneha Patel", score: 89, role: "Student", labsCompleted: 10, time: "13m 20s" },
    { rank: 5, name: "Vikram Singh", score: 88, role: "Student", labsCompleted: 10, time: "16m 05s" },
    { rank: 6, name: "Priya Das", score: 85, role: "Student", labsCompleted: 9, time: "17m 50s" },
    { rank: 7, name: "Karan Malhotra", score: 82, role: "Student", labsCompleted: 8, time: "14m 40s" },
];

export default function LeaderboardsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <PremiumNavbar pathname="/leaderboards" />
            
            <main className="pt-28 pb-16 container max-w-5xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-border pb-6">
                        <div className="flex items-center gap-4">
                            <i className="bx bx-trophy text-4xl text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Leaderboards</h1>
                                <p className="text-muted-foreground mt-1">See how you rank among your peers.</p>
                            </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 uppercase tracking-widest text-xs font-bold px-4 py-2 rounded-none">
                            Global Ranking
                        </Badge>
                    </div>

                    <Card className="border border-border shadow-sm rounded-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted text-muted-foreground font-bold tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Rank</th>
                                        <th scope="col" className="px-6 py-4">Student Name</th>
                                        <th scope="col" className="px-6 py-4">Labs Completed</th>
                                        <th scope="col" className="px-6 py-4">Avg Time</th>
                                        <th scope="col" className="px-6 py-4 text-right">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user, index) => (
                                        <tr key={index} className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {user.rank === 1 && <span className="text-yellow-500 font-bold text-lg">🥇 1</span>}
                                                {user.rank === 2 && <span className="text-slate-400 font-bold text-lg">🥈 2</span>}
                                                {user.rank === 3 && <span className="text-amber-600 font-bold text-lg">🥉 3</span>}
                                                {user.rank > 3 && <span className="text-foreground">#{user.rank}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{user.name}</div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-foreground">{user.labsCompleted}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{user.time}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="bg-primary text-primary-foreground font-bold px-3 py-1 text-sm rounded-none shadow-sm">
                                                    {user.score}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
