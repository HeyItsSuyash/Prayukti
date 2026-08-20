"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import { usePathname } from "next/navigation";

type Message = {
    role: "assistant" | "user";
    content: string;
};

export function AssistantBot() {
    const pathname = usePathname();
    
    if (pathname && pathname.includes("/forgot-password")) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Welcome to Prayukti vLAB! I'm your AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const userMsg = input.trim();

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsTyping(true);

        try {
            const token = localStorage.getItem("vlab_access_token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userMsg, subject: "General Lab Assistant" }),
            });

            const data = await response.json();

            if (data.response) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error while processing your request." }]);
            }
        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (pathname === '/login' || pathname === '/register' || pathname === '/verify') return null;

    return (
        <>
            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100]"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-background z-[101] flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="bg-card border-b border-border p-5 flex items-center justify-between text-foreground">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-full">
                                        <img src="/prayukti 2.0/illustrations/ai_chatbot.png" alt="AI Chatbot" className="w-full h-full object-contain scale-[1.3]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-wide text-foreground">Prayukti AI Assistant</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                                >
                                    <i className="bx bx-x text-xl" />
                                </button>
                            </div>

                            {/* Chat Body */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 bg-background"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-10 h-10 flex-shrink-0 mt-1 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                                <img src="/prayukti 2.0/illustrations/ai_chatbot.png" alt="Bot" className="w-full h-full object-contain scale-[1.3]" />
                                            </div>
                                        )}
                                        <div className={`max-w-[78%] p-4 text-sm font-medium leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-sm'
                                            : 'bg-card text-foreground rounded-2xl rounded-tl-sm border border-border shadow-sm'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:mb-2 prose-p:last:mb-0">
                                                    <ReactMarkdown>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start gap-3">
                                        <div className="w-12 h-12 flex-shrink-0 mt-1">
                                            <img src="/prayukti 2.0/illustrations/ai_chatbot.png" alt="Bot" className="w-full h-full object-contain scale-[1.45]" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm  flex items-center gap-1.5 h-10 mt-1">
                                            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-white dark:bg-background border-t border-slate-100 dark:border-slate-800">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isTyping}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask Prayukti AI..."
                                        className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-100 dark:bg-card border-2 border-transparent focus:border-primary/50 dark:focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder-slate-500"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        className="absolute right-2 top-2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90  disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            {!isOpen && (
                <div className="fixed bottom-2 right-2 z-50 flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-[117px] h-[117px] flex items-center justify-center  duration-300 relative focus:outline-none focus-visible:outline-none outline-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)]"
                    >
                        <img
                            src="/prayukti 2.0/illustrations/ai_chatbot.png"
                            alt="Chat"
                            className="w-full h-full object-contain scale-[1.1] drop-"
                        />
                    </motion.button>
                </div>
            )}
        </>
    );
}
