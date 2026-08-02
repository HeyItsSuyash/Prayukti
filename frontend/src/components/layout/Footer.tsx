"use client";




export function Footer() {
    return (
        <footer className="bg-secondary text-white py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <a href="/" className="flex items-center gap-3 group">
                            <span className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold shadow-inner">
                                <i className="bx bx-command text-xl" />
                            </span>
                            <span className="text-2xl font-bold tracking-tight">
                                Prayukti <span className="text-primary-foreground">x MMMUT</span>
                            </span>
                        </a>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-xs font-medium">
                            A next-generation virtual laboratory platform designed to bridge the gap between theoretical knowledge and practical application for engineering students.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            {[
                                { icon: 'bx-command', label: 'Twitter' },
                                { icon: 'bx-command', label: 'Facebook' },
                                { icon: 'bx-command', label: 'Linkedin' },
                                { icon: 'bx-command', label: 'Instagram' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                    aria-label={social.label}
                                >
                                    <i className={`bx ${social.icon} text-lg`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4 text-base">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Student Login", href: "/auth/login" },
                                { name: "Faculty Login", href: "/faculty/login" },
                                { name: "Explore Labs", href: "/explore" },
                                { name: "CSIS Society", href: "https://csis-society-mmmut.vercel.app/" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-300 hover:text-white text-sm transition-all relative py-1 group inline-block font-medium">
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4 text-base">Support & Legal</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Support", href: "/support" },
                                { name: "Contact ", href: "/support" },
                                { name: "FAQ", href: "/terms" },
                                { name: "Report a Bug", href: "#" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="text-slate-300 hover:text-white text-sm transition-all relative py-1 group inline-block font-medium">
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-white mb-4 text-base">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <i className="bx bx-map-pin text-primary mt-1" />
                                <span className="text-muted-foreground text-sm">Madan Mohan Malaviya University of Technology, Gorakhpur, UP 273010</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="bx bx-phone text-primary" />
                                <span className="text-muted-foreground text-sm">+91 123 456 7890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="bx bx-envelope text-primary" />
                                <span className="text-muted-foreground text-sm">contact@prayukti.mmmut.ac.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <img src="/mmm-logo.png" alt="MMMUT Logo" className="w-10 h-10 object-contain" />
                            <p className="text-sm font-semibold text-slate-300 max-w-[280px] leading-tight">
                                Prayukti for Madan Mohan Malaviya University of Technology, Gorakhpur
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                            <p className="text-sm font-medium text-slate-400">
                                © 2025 Prayukti. All rights reserved.
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                A project developed by the Computer Science and Innovation Society (CSIS), MMMUT Gorakhpur.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                        <a href="/cookie-policy" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

