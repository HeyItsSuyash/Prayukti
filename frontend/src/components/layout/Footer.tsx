"use client";


import { Command, Twitter, Facebook, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-primary text-white py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <a href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-md overflow-hidden border-2 border-white/20">
                                <img
                                    src="http://www.mmmut.ac.in/images/largelogo.jpg"
                                    alt="MMMUT Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-2xl font-black tracking-tight">
                                Prayukti <span className="text-accent">x MMMUT</span>
                            </span>
                        </a>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-xs font-medium">
                            A next-generation virtual laboratory platform designed to bridge the gap between theoretical knowledge and practical application for engineering students.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:scale-110 transition-all duration-300 border border-white/5">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-bold text-accent mb-2 uppercase tracking-wider text-[14px]">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Student Login", href: "/auth/login" },
                                { name: "Faculty Login", href: "/faculty/login" },
                                { name: "Explore Labs", href: "/explore" },
                                { name: "CSIS Society", href: "https://csis-society-mmmut.vercel.app/" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-300 hover:text-white text-sm transition-all relative py-1 group inline-block uppercase tracking-widest text-[12px]">
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-bold text-accent mb-2 uppercase tracking-wider text-[14px]">Support & Legal</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Support", href: "/support" },
                                { name: "Contact ", href: "/support" },
                                { name: "FAQ", href: "/terms" },
                                { name: "Report a Bug", href: "#" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-300 hover:text-white text-sm transition-all relative py-1 group inline-block uppercase tracking-widest text-[12px]">
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-accent mb-2 uppercase tracking-wider text-[14px]">Contact US</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-4 text-sm text-slate-300">
                                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <span className="leading-relaxed font-medium">
                                    Madan Mohan Malaviya University of Technology<br />
                                    Gorakhpur, Uttar Pradesh, India - 273010
                                </span>
                            </li>
                            <li className="flex items-center gap-4 text-sm text-slate-300">
                                <Phone className="w-5 h-5 text-accent shrink-0" />
                                <span className="font-medium">+91 8382864910</span>
                            </li>
                            <li className="flex items-center gap-4 text-sm text-slate-300">
                                <Mail className="w-5 h-5 text-accent shrink-0" />
                                <span className="hover:text-white cursor-pointer transition-colors font-medium">vlab.support@mmmut.ac.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-slate-400">
                            © 2025 Prayukti x MMMUT. All rights reserved.
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            A project developed by the Computer Science and Innovation Society (CSIS), MMMUT Gorakhpur.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
                        <a href="/cookie-policy" className="hover:text-accent transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
