"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { PremiumFooter } from "@/components/layout/PremiumFooter";


export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <PremiumNavbar pathname="/404" />

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#059669]/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14D98F]/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <h1 className="text-9xl font-black text-slate-200 dark:text-white/5 tracking-tighter select-none">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#059669]/10 rounded-full flex items-center justify-center  border border-[#059669]/20">
                    <i className="bx bx-error-circle w-12 h-12 text-[#14D98F] animate-pulse flex items-center justify-center text-5xl"  />
                  </div>
                </div>
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-4"
            >
              Page Not Found
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-lg mx-auto leading-relaxed"
            >
              The lab module or page you are looking for has been moved, deleted, or does not exist.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="h-14 px-8 text-base rounded-xl font-bold border-white/10 text-slate-300 hover:bg-white/5 hover:text-white gap-2 "
              >
                <i className="bx bx-left-arrow-alt w-5 h-5 flex items-center justify-center text-xl"  /> Go Back
              </Button>

              <a href="/">
                <Button className="h-14 px-8 text-base rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white gap-2 w-full sm:w-auto shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5 ">
                  <i className="bx bx-home w-5 h-5 flex items-center justify-center text-xl"  /> Return to Home
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
