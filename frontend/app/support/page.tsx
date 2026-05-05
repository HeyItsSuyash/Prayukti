"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <Navbar />
            
            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-6xl">
                    <header className="text-center mb-20 space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black text-primary dark:text-white tracking-tighter uppercase leading-none">
                            Help & <span className="text-accent">Support</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-slate-100 dark:bg-slate-900 inline-block px-4 py-1.5 rounded-full">
                            We're here to assist you with your experiments
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Information */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">Contact Details</h2>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                                    Reach out to our technical team for assistance with simulations, account access, or departmental queries.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {[
                                    { icon: Mail, label: "Email Support", value: "vlab.support@mmmut.ac.in", desc: "Response within 24 hours" },
                                    { icon: Phone, label: "Technical Helpline", value: "+91 551-2273958", desc: "Mon-Fri, 10 AM - 5 PM" },
                                    { icon: MapPin, label: "Office Location", value: "IT Resource Centre, MMMUT", desc: "Gorakhpur, UP - 273010" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border-2 border-slate-50 dark:border-slate-900 hover:border-accent/20 transition-all group">
                                        <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                                            <p className="text-lg font-bold text-primary dark:text-white">{item.value}</p>
                                            <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ticket Form */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">Raise a Ticket</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Describe your issue in detail</p>
                                </div>
                            </div>

                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</Label>
                                    <Input className="h-14 rounded-xl border-2 bg-white dark:bg-slate-950 font-bold" placeholder="Your name" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Issue Subject</Label>
                                    <Input className="h-14 rounded-xl border-2 bg-white dark:bg-slate-950 font-bold" placeholder="e.g. Simulation Error" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Detailed Message</Label>
                                    <textarea className="w-full min-h-[150px] p-4 rounded-xl border-2 bg-white dark:bg-slate-950 font-bold text-sm resize-none focus:border-accent outline-none transition-all" placeholder="Tell us what's happening..." />
                                </div>

                                <Button className="w-full h-16 bg-accent hover:bg-accent/90 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/20 border-0 group active:scale-[0.98] transition-all">
                                    Submit Ticket <Send size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
