'use client';

import React, { useState, useEffect } from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Load preferences on mount
        const prefs = localStorage.getItem('vlab_settings');
        if (prefs) {
            try {
                const parsed = JSON.parse(prefs);
                if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications);
                if (parsed.smsNotifications !== undefined) setSmsNotifications(parsed.smsNotifications);
                if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
                if (parsed.publicProfile !== undefined) setPublicProfile(parsed.publicProfile);
            } catch (e) {
                console.error("Failed to parse settings");
            }
        } else {
            // Check if system is dark mode or document has dark class
            setDarkMode(document.documentElement.classList.contains('dark'));
        }
    }, []);

    const toggleDarkMode = (isDark: boolean) => {
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        const prefs = {
            emailNotifications,
            smsNotifications,
            darkMode,
            publicProfile
        };
        localStorage.setItem('vlab_settings', JSON.stringify(prefs));
        
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
            <PremiumNavbar pathname="/settings" />
            
            <main className="pt-28 pb-16 container max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <i className="bx bx-cog text-4xl text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                            <p className="text-muted-foreground mt-1">Manage your application preferences and configurations.</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Notifications Settings */}
                        <Card className="border border-border shadow-sm rounded-none bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <i className="bx bx-bell text-primary" /> Notifications
                                </CardTitle>
                                <CardDescription>Choose how you want to be notified about updates and activities.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <p className="font-bold text-foreground">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive updates and test scores via email.</p>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 flex items-center cursor-pointer transition-colors p-1 ${emailNotifications ? 'bg-primary' : 'bg-muted'} rounded-full`}
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <p className="font-bold text-foreground">SMS Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive critical alerts via SMS.</p>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 flex items-center cursor-pointer transition-colors p-1 ${smsNotifications ? 'bg-primary' : 'bg-muted'} rounded-full`}
                                        onClick={() => setSmsNotifications(!smsNotifications)}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appearance Settings */}
                        <Card className="border border-border shadow-sm rounded-none bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <i className="bx bx-palette text-primary" /> Appearance
                                </CardTitle>
                                <CardDescription>Customize the look and feel of your workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <p className="font-bold text-foreground">Dark Mode</p>
                                        <p className="text-sm text-muted-foreground">Toggle the dark theme across the application.</p>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 flex items-center cursor-pointer transition-colors p-1 ${darkMode ? 'bg-primary' : 'bg-muted'} rounded-full`}
                                        onClick={() => toggleDarkMode(!darkMode)}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Settings */}
                        <Card className="border border-border shadow-sm rounded-none bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <i className="bx bx-lock-alt text-primary" /> Privacy & Security
                                </CardTitle>
                                <CardDescription>Control who can see your profile and activity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <p className="font-bold text-foreground">Public Profile</p>
                                        <p className="text-sm text-muted-foreground">Allow your profile to be visible on leaderboards.</p>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 flex items-center cursor-pointer transition-colors p-1 ${publicProfile ? 'bg-primary' : 'bg-muted'} rounded-full`}
                                        onClick={() => setPublicProfile(!publicProfile)}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${publicProfile ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-start gap-3">
                                    <Button variant="outline" className="border-border text-foreground hover:bg-muted rounded-none">Change Password</Button>
                                    <Button variant="destructive" className="rounded-none">Delete Account</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4 items-center gap-4">
                            {showSuccess && (
                                <span className="text-green-500 font-bold text-sm animate-pulse flex items-center gap-2">
                                    <i className="bx bx-check-circle text-lg" /> Settings Saved
                                </span>
                            )}
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-none px-8 py-5 text-md font-bold disabled:opacity-70"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
