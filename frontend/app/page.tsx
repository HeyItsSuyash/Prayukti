"use client";

import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Zap,
  Building2,
  Star,
  Clock,
  Wrench,
  ArrowRight,
  Play,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { FAQ } from "@/components/home/FAQ";
import { Footer } from "@/components/layout/Footer";
import { AcademicModulesSection } from "@/components/home/AcademicModulesSection";
import { MissionVisionSection } from "@/components/home/MissionVisionSection";
import { CSISSection } from "@/components/home/CSISSection";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-primary dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1">
        {/* 1. Professional Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden bg-slate-950">
          {/* Background Image & Professional Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="MMMUT Gorakhpur Campus"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            {/* Subtle Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]"></div>
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-20">
            <div className="max-w-3xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/5 text-accent px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 backdrop-blur-sm"
              >
                University Virtual Laboratory
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase"
              >
                MAKING IT<br />
                <span className="text-accent">PRACTICAL.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <p className="text-base md:text-lg text-slate-400 max-w-lg leading-relaxed font-medium">
                  Master engineering concepts through high-fidelity digital twin simulations, built exclusively for the MMMUT Gorakhpur curriculum.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                <Link href="/login">
                  <Button size="lg" className="h-16 px-10 text-[10px] rounded-xl bg-accent text-white hover:bg-accent/90 border-0 font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-accent/20">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" className="h-16 px-10 text-[10px] rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md font-black uppercase tracking-[0.2em] transition-all">
                    Explore Labs
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 md:gap-8 pt-16 border-t border-white/5"
              >
                {[
                  { icon: ShieldCheck, label: "University Verified" },
                  { icon: Cpu, label: "Real-time physics" },
                  { icon: Play, label: "Instant Access" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/30 whitespace-nowrap">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-accent/50" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Subtle Decorative Gradient */}
          <div className="absolute right-[-10%] bottom-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] -z-0"></div>
        </section>

        {/* 2. Professional Metrics (Row-based, no simple cards) */}
        <section className="bg-white dark:bg-slate-950 py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-wrap justify-between gap-12 items-center">
              {[
                { label: "Active Students", value: "10K+", icon: <Users className="w-5 h-5" /> },
                { label: "Lab Modules", value: "150+", icon: <Zap className="w-5 h-5" /> },
                { label: "Institutions", value: "01", icon: <Building2 className="w-5 h-5" /> },
                { label: "Syllabus Match", value: "100%", icon: <Star className="w-5 h-5" /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-primary dark:text-white leading-none mb-2">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MissionVisionSection />

        <AcademicModulesSection />

        <CSISSection />

        {/* 3. Core Philosophy (Cleaned up) */}
        <section className="py-32 bg-primary text-white relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-white/5 px-4 py-2 rounded-full inline-block border border-white/10">Core Philosophy</span>
                <h2 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase">
                  BUILT FOR <br />
                  <span className="text-accent">PRECISION.</span>
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-lg font-medium">
                  Engineered specifically for the MMMUT academic environment, facilitating a seamless bridge between theoretical lectures and practical mastery.
                </p>
                <div className="flex gap-12 pt-6">
                  <div>
                    <p className="text-6xl font-black text-white leading-none mb-3">100%</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Syllabus Match</p>
                  </div>
                  <div className="border-l border-white/10 pl-12">
                    <p className="text-6xl font-black text-white leading-none mb-3">~0ms</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Input Latency</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { title: "24/7 Lab Access", desc: "Experiment anytime, anywhere without lab hour restrictions or hardware limits.", icon: <Clock className="w-6 h-6" /> },
                  { title: "Instant Validation", desc: "Real-time feedback on logic circuits and code execution to accelerate learning.", icon: <Zap className="w-6 h-6" /> },
                  { title: "Standardized Tools", desc: "Digital interfaces modeled strictly after industrial and academic laboratory tools.", icon: <Wrench className="w-6 h-6" /> },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 hover:border-accent/30 transition-all group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
