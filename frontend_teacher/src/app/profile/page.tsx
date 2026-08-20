'use client';

import React, { useEffect, useState } from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Edit Profile State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    
    // Reset Password State
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
    const [passwordError, setPasswordError] = useState("");
    const [showSuccess, setShowSuccess] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setEditName(parsed.fullName || "");
            } catch (e) {
                console.error("Failed to parse user details.");
            }
        }
        setIsLoading(false);
    }, []);

    const handleSaveProfile = () => {
        if (!editName.trim()) return;
        const updatedUser = { ...user, fullName: editName.trim() };
        setUser(updatedUser);
        localStorage.setItem('vlab_user', JSON.stringify(updatedUser));
        setIsEditOpen(false);
        setShowSuccess("Profile updated successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        // Force reload to update navbar
        window.dispatchEvent(new Event("storage"));
    };

    const handleResetPassword = () => {
        if (!passwords.current || !passwords.newPass || !passwords.confirm) {
            setPasswordError("All fields are required");
            return;
        }
        if (passwords.newPass !== passwords.confirm) {
            setPasswordError("New passwords do not match");
            return;
        }
        if (passwords.newPass.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        
        setPasswordError("");
        setIsResetOpen(false);
        setPasswords({ current: "", newPass: "", confirm: "" });
        setShowSuccess("Password reset successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
    };

    const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <PremiumNavbar pathname="/profile" />
            
            <main className="pt-28 pb-16 container max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-border pb-6">
                        <div className="flex items-center gap-4">
                            <i className="bx bx-user-circle text-4xl text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                                <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
                            </div>
                        </div>
                        {showSuccess && (
                            <span className="text-green-500 font-bold text-sm animate-pulse flex items-center gap-2">
                                <i className="bx bx-check-circle text-lg" /> {showSuccess}
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="loader border-border border-b-primary"></div>
                        </div>
                    ) : user ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-1 border border-border  rounded-none">
                                <CardContent className="flex flex-col items-center pt-8 pb-6">
                                    <div className="w-24 h-24 rounded-full border border-border shadow-sm overflow-hidden bg-slate-800 mb-4">
                                        <img src="/prayukti 2.0/illustrations/avatar.avif" alt="User Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground text-center mb-1">{user.fullName}</h2>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2 border border-border  rounded-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">Account Information</CardTitle>
                                    <CardDescription>Personal details associated with your account.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</span>
                                            <p className="font-medium text-foreground">{user.fullName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
                                            <p className="font-medium text-foreground">{user.email || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User ID</span>
                                            <p className="font-medium text-foreground">{user.id || 'usr_' + Math.random().toString(36).substr(2, 9)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Status</span>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                <p className="font-medium text-foreground">Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                                        {/* Reset Password Dialog */}
                                        <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="border-border rounded-none">Reset Password</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] rounded-none">
                                                <DialogHeader>
                                                    <DialogTitle>Reset Password</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your current password and a new secure password.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    {passwordError && <p className="text-red-500 text-sm font-bold">{passwordError}</p>}
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="current">Current Password</Label>
                                                        <Input id="current" type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="rounded-none" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="new">New Password</Label>
                                                        <Input id="new" type="password" value={passwords.newPass} onChange={(e) => setPasswords({...passwords, newPass: e.target.value})} className="rounded-none" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="confirm">Confirm New Password</Label>
                                                        <Input id="confirm" type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="rounded-none" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleResetPassword} className="bg-primary hover:bg-primary/90 rounded-none">Save Password</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Edit Profile Dialog */}
                                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground  rounded-none">Edit Profile</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] rounded-none">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Profile</DialogTitle>
                                                    <DialogDescription>
                                                        Make changes to your profile here. Click save when you're done.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name">Full Name</Label>
                                                        <Input 
                                                            id="name" 
                                                            value={editName} 
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="rounded-none"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 rounded-none">Save changes</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="border border-border rounded-none">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <i className="bx bx-error-circle text-4xl text-muted-foreground mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Not Logged In</h3>
                                <p className="text-muted-foreground mt-2 mb-6">Please log in to view your profile details.</p>
                                <Button onClick={() => window.location.href = '/login'} className="bg-primary hover:bg-primary/90 rounded-none">
                                    Go to Login
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
