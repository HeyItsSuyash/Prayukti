"use client";

import { API_URL } from "@/lib/config";

import { Suspense, useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Admin Views
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { SubjectManagement } from '@/components/admin/SubjectManagement';
import { ExperimentManagement } from '@/components/admin/ExperimentManagement';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ActivityLogView } from '@/components/admin/ActivityLogView';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { EnrollmentForm } from '@/components/admin/EnrollmentForm';
import AdminTimetableBuilder from '@/components/timetable/AdminTimetableBuilder';
import { AcademicSetup } from '@/components/admin/AcademicSetup';

// Current Dashboard (for Overview/Students)
import { StudentTable } from './StudentTable';
import { StudentDetailView } from './StudentDetailView';

const NAV_ITEMS = [
    { id: 'overview', label: 'Command Center', icon: 'bx bx-layout' },
    { id: 'students', label: 'Students', icon: 'bx bxs-graduation' },
    { id: 'teachers', label: 'Faculty & Staff', icon: 'bx bx-user' },
    { id: 'academic-setup', label: 'Academic Setup', icon: 'bx bx-layer' },
    { id: 'timetable', label: 'Timetable', icon: 'bx bx-book-open' },
    { id: 'subjects', label: 'Subjects (V-Lab)', icon: 'bx bx-flask' },
    { id: 'analytics', label: 'Analytics', icon: 'bx bx-pulse' },
    { id: 'logs', label: 'System Logs', icon: 'bx bx-file' },
    { id: 'settings', label: 'Settings', icon: 'bx bx-cog' },
];

function StatCard({ title, value, subtext, icon: Icon, trend }: any) {
    return (
        <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all overflow-hidden group">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                    <i className={`${Icon} text-[80px]`} />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
                        <i className={`${Icon} text-2xl`} />
                    </div>
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">{title}</h3>
                    <div className="text-4xl font-black text-white tracking-tighter mb-2">{value}</div>
                    <div className="flex items-center gap-2">
                        {trend && <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{trend}</span>}
                        <span className="text-xs font-medium text-white/40">{subtext}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AdminContent() {
    const [currentView, setCurrentView] = useState('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vlab_token');
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Failed to fetch users");
            const allUsers = await res.json();

            const fetchedStudents = allUsers
                .filter((u: any) => u.role === 'student' || u.role === undefined)
                .map((u: any) => ({
                    id: u._id,
                    name: u.fullName,
                    rollNo: u.rollNo || "N/A",
                    email: u.email,
                    branch: u.branch || "N/A",
                    semester: u.semester || "N/A",
                    practicalsAssigned: 10,
                    practicalsCompleted: 2,
                    quizScoreAvg: 75,
                    avgAttempts: 1.2,
                    status: 'Good'
                }));
            
            const fetchedTeachers = allUsers.filter((u: any) => u.role === 'teacher' || u.role === 'admin');
                
            setData(fetchedStudents);
            setTeachers(fetchedTeachers);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (window.innerWidth < 1024) setSidebarOpen(false);
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('vlab_token');
            if (token) {
                await fetch(`${API_URL}/api/attendance/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {}
        localStorage.removeItem('vlab_user');
        localStorage.removeItem('vlab_token');
        window.location.href = ('/login');
    };

    const renderView = () => {
        if (selectedStudent && (currentView === 'overview' || currentView === 'students')) {
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <Button variant="outline" onClick={() => setSelectedStudent(null)} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <i className="bx bx-arrowleft mr-2 h-4 w-4"  /> Back to List
                    </Button>
                    <StudentDetailView student={selectedStudent} />
                </div>
            );
        }

        switch (currentView) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard title="Total Students" value={data.length} subtext="vs last month" trend="+12%" icon="bx bxs-group" />
                            <StatCard title="Total Staff" value={teachers.length} subtext="Active administration" trend="+2" icon="bx bx-check-shield" />
                            <StatCard title="System Load" value="24%" subtext="Server performance" trend="-5%" icon="bx bx-pulse" />
                            <StatCard title="Security" value="SAFE" subtext="No threats detected" icon="bx bx-shield" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                                    <div className="p-6 flex justify-between items-center border-b border-white/10">
                                        <h3 className="text-xl font-bold text-white tracking-tight">Recent Enrollments</h3>
                                        <Button variant="link" className="text-accent" onClick={() => setCurrentView('students')}>
                                            View All <i className="bx bx-chevronright w-4 h-4 ml-1"  />
                                        </Button>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="bg-white/5 p-4 m-6 rounded-2xl">
                                            <StudentTable data={data.slice(0, 5)} onViewStudent={(s) => setSelectedStudent(s)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="rounded-[2rem] border-none bg-gradient-to-br from-accent/80 to-accent text-white p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                            <i className="bx bx-userplus"  />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-1">Fast Enrollment</h3>
                                            <p className="text-white/80 text-sm font-medium">Add new students or faculty instantly.</p>
                                        </div>
                                        <Button onClick={() => setCurrentView('students')} className="w-full bg-white text-accent hover:bg-slate-50 font-bold py-6 rounded-xl">
                                            Open Form
                                        </Button>
                                    </div>
                                </Card>
                                
                                <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
                                    <div className="p-6 border-b border-white/10">
                                        <h3 className="font-bold text-white">System Status</h3>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-medium text-white/80">Database API</span>
                                            </div>
                                            <span className="text-xs text-emerald-400">Online</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-medium text-white/80">Authentication</span>
                                            </div>
                                            <span className="text-xs text-emerald-400">Online</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                );
            case 'students':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Student Management</h2>
                                <p className="text-white/60 text-sm mt-1">Enroll and manage student records</p>
                            </div>
                        </div>
                        <EnrollmentForm onSuccess={fetchData} />
                        <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden mt-8">
                            <CardContent className="p-6">
                                <StudentTable data={data} onViewStudent={(s) => setSelectedStudent(s)} />
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'teachers': return <TeacherManagement />;
            case 'academic-setup': return <AcademicSetup />;
            case 'timetable': return <AdminTimetableBuilder />;
            case 'subjects': return <SubjectManagement />;
            case 'analytics': return <AnalyticsDashboard />;
            case 'logs': return <ActivityLogView />;
            case 'settings': return <SettingsPanel />;
            default: return <div className="text-white/60">Module under construction</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-20'} 
                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-2xl relative z-40 overflow-hidden
            `}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-500">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
                            <span className="font-bold tracking-tight text-white">Admin Panel</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors lg:hidden"
                    >
                        <i className="bx bx-x"  />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const active = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`
                                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                                    ${active 
                                        ? 'bg-accent/10 text-accent font-bold' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
                                    }
                                    ${!isSidebarOpen ? 'justify-center' : ''}
                                `}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                <i className={`${item.icon} text-xl ${active ? 'text-accent' : 'text-white/40'}`} />
                                {isSidebarOpen && <span>{item.label}</span>}
                                {active && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/5 shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                            text-red-400 hover:bg-red-400/10 font-medium
                            ${!isSidebarOpen ? 'justify-center' : ''}
                        `}
                    >
                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0">
                            <i className="bx bx-shieldcheck"  />
                        </div>
                        {isSidebarOpen && <span>Secure Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
                {/* Topbar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/20 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-white/50 hover:text-white bg-white/5 rounded-xl transition-colors"
                        >
                            <i className="bx bx-menu"  />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold text-white capitalize">{currentView.replace('-', ' ')}</h2>
                            <p className="text-xs text-white/40">Administration Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-white/60 hover:text-white bg-white/5 rounded-full transition-colors relative">
                            <i className="bx bx-bell"  />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-slate-950" />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white">System Admin</div>
                                <div className="text-[10px] text-accent uppercase tracking-widest font-bold">Verified</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center border-2 border-slate-950 text-white font-bold shadow-lg">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        {renderView()}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-950">Loading Administration...</div>}>
            <AdminContent />
        </Suspense>
    );
}
