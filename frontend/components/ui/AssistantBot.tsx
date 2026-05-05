"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, MessageSquare, Sparkles, User, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AssistantBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Welcome to Prayukti Virtual Lab! I'm your academic assistant. How can I help you with your simulations today?" }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");

        // Simple mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I'm currently in 'Navigation Mode'. You can ask me to find specific labs like 'Computer Networks' or 'DBMS', or I can help you with the login process." 
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-10 left-10 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom left" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-6 w-[380px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Prayukti Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Online & Ready</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <Minimize2 size={18} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div 
                            ref={scrollRef}
                            className="h-[400px] overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50"
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-accent text-white rounded-tr-none shadow-lg' 
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="w-full h-14 pl-6 pr-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-accent outline-none transition-all text-sm font-bold placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-3 top-3 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-accent transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                            <p className="text-[9px] text-center text-slate-400 mt-4 font-black uppercase tracking-[0.2em]">Prayukti AI Model v1.0.2</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 border-0 ${
                    isOpen ? 'bg-primary text-white rotate-90' : 'bg-white dark:bg-slate-900 text-accent hover:bg-accent hover:text-white'
                }`}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <MessageSquare size={28} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
