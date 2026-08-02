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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                            className="fixed inset-0 bg-[#021D24]/60 backdrop-blur-sm z-[100]"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[101] flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-[#021D24] p-6 flex items-center justify-between text-white border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        <img src="/prayukti 2.0/illustrations/ai_chatbot.png" alt="AI Chatbot" className="w-full h-full object-contain scale-[1.45]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-wide">Prayukti AI</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <i className="bx bx-x text-xl" />
                                </button>
                            </div>

                            {/* Chat Body */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-12 h-12 flex-shrink-0 mt-1">
                                                <img src="/prayukti 2.0/illustrations/ai_chatbot.png" alt="Bot" className="w-full h-full object-contain scale-[1.45]" />
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] p-4 text-sm font-medium leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-md'
                                            : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm prose-slate max-w-none prose-p:mb-2 prose-p:last:mb-0">
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
                                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-10 mt-1">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-white border-t border-slate-100">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask me anything..."
                                        className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-100 border-2 border-transparent focus:border-primary/50 focus:bg-white outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        className="absolute right-2 top-2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-[117px] h-[117px] flex items-center justify-center transition-all duration-300 relative focus:outline-none focus-visible:outline-none outline-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)]"
                    >
                        <img
                            src="/prayukti 2.0/illustrations/ai_chatbot.png"
                            alt="Chat"
                            className="w-full h-full object-contain scale-[1.1] drop-shadow-lg"
                        />
                    </motion.button>
                </div>
            )}
        </>
    );
}
