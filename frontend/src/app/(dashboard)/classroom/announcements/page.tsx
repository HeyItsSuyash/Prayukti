"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Megaphone, 
    MessageSquare, 
    Heart, 
    Bookmark, 
    BookmarkCheck, 
    Plus, 
    Download, 
    Sparkles, 
    Languages, 
    CheckSquare,
    Send,
    Loader2,
    AlertCircle
} from "lucide-react";

interface Announcement {
    _id: string;
    teacherId: string;
    teacherName: string;
    subjectId: string;
    title: string;
    content: string;
    createdAt: string;
    comments: any[];
    reactions: string[];
    isBookmarked: boolean;
    resources: any[];
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);

    // Form state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [resourceTitle, setResourceTitle] = useState("");
    const [resourceType, setResourceType] = useState("pdf");
    const [resourceUrl, setResourceUrl] = useState("");
    const [addedResources, setAddedResources] = useState<any[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Active AI State
    const [aiResult, setAiResult] = useState<string>("");
    const [aiTitle, setAiTitle] = useState<string>("");
    const [aiOpen, setAiOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // Comment states
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
    const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                
                
                // Fetch announcements
                const aRes = await fetch(`${API_URL}/api/announcement`, {
                    credentials: "include",
                    headers: {}
                });
                if (!aRes.ok) throw new Error("Failed to load announcements");
                const aData = await aRes.json();
                setAnnouncements(aData);

                // Fetch subjects
                const sRes = await fetch(`${API_URL}/api/subjects`);
                if (sRes.ok) {
                    const sData = await sRes.json();
                    setSubjects(sData);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";

    const handleAddResource = () => {
        if (!resourceTitle || !resourceUrl) return;
        setAddedResources(prev => [...prev, [resourceTitle, resourceType, resourceUrl]]);
        setResourceTitle("");
        setResourceUrl("");
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !selectedSubject) return;

        setSubmitLoading(true);
        try {
            
            const res = await fetch(`${API_URL}/api/announcement`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSubject,
                    title,
                    content,
                    resources: addedResources.length > 0 ? addedResources : null
                })
            });

            if (!res.ok) throw new Error("Failed to post announcement");
            
            const newAnn = await res.json();
            setAnnouncements(prev => [newAnn, ...prev]);
            setDialogOpen(false);
            setTitle("");
            setContent("");
            setAddedResources([]);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handlePostComment = async (annId: string) => {
        const text = commentTexts[annId];
        if (!text || !text.trim()) return;

        try {
            
            const res = await fetch(`${API_URL}/api/announcement/${annId}/comment`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: text })
            });

            if (!res.ok) throw new Error("Comment post failed");
            const newComment = await res.json();

            setAnnouncements(prev => prev.map(a => {
                if (a._id === annId) {
                    return { ...a, comments: [...a.comments, newComment] };
                }
                return a;
            }));

            setCommentTexts(prev => ({ ...prev, [annId]: "" }));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleReaction = async (annId: string, reaction: string) => {
        try {
            
            const res = await fetch(`${API_URL}/api/announcement/${annId}/react`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reaction })
            });

            if (res.ok) {
                const { added } = await res.json();
                setAnnouncements(prev => prev.map(a => {
                    if (a._id === annId) {
                        const nextReactions = added 
                            ? [...a.reactions, reaction]
                            : a.reactions.filter(r => r !== reaction);
                        return { ...a, reactions: nextReactions };
                    }
                    return a;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleBookmark = async (annId: string) => {
        try {
            
            const res = await fetch(`${API_URL}/api/announcement/${annId}/bookmark`, {
                    credentials: "include",
                method: 'POST',
                headers: {}
            });

            if (res.ok) {
                const { bookmarked } = await res.json();
                setAnnouncements(prev => prev.map(a => {
                    if (a._id === annId) {
                        return { ...a, isBookmarked: bookmarked };
                    }
                    return a;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAiFeature = async (annId: string, feature: "summarize" | "translate" | "action-items") => {
        setAiLoading(true);
        setAiOpen(true);
        setAiResult("");

        if (feature === "summarize") {
            setAiTitle("AI Announcement Summary");
        } else if (feature === "translate") {
            setAiTitle("Hindi Translation");
        } else {
            setAiTitle("Action items & Deadlines");
        }

        try {
            
            let url = `${API_URL}/api/announcement/${annId}/${feature}`;
            if (feature === "translate") {
                url += `?lang=Hindi`;
            }

            const res = await fetch(url, {
                    credentials: "include",
                headers: {}
            });

            if (res.ok) {
                const data = await res.json();
                if (feature === "summarize") {
                    setAiResult(data.summary);
                } else if (feature === "translate") {
                    setAiResult(data.translatedText);
                } else {
                    const list = data.actionItems.map((item: string) => `• ${item}`).join("\n");
                    setAiResult(list);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Announcement <span className="text-indigo-600 dark:text-indigo-400 italic">Feed</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Classroom message boards. Share files, notes, and solve outlines collaboratively.
                        </p>
                    </div>

                    {isTeacher && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <Plus size={14} /> New Announcement
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2rem] border-2 max-w-lg bg-white dark:bg-slate-900 overflow-y-auto max-h-[85vh] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Create Announcement</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="subject" className="font-bold text-xs uppercase text-slate-400">Classroom Subject</Label>
                                        <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                                            <SelectTrigger className="rounded-xl border-2">
                                                <SelectValue placeholder="Select Subject" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {subjects.map((s) => (
                                                    <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="title" className="font-bold text-xs uppercase text-slate-400">Announcement Title</Label>
                                        <Input 
                                            id="title" 
                                            placeholder="E.g., Lab Assignment 3 Deadlines"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="rounded-xl border-2"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="content" className="font-bold text-xs uppercase text-slate-400">Message Content</Label>
                                        <Textarea 
                                            id="content" 
                                            placeholder="Write message details..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="rounded-xl border-2 min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    {/* Upload Resources Segment */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Attach Study Materials</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input 
                                                placeholder="Title" 
                                                value={resourceTitle} 
                                                onChange={(e) => setResourceTitle(e.target.value)}
                                                className="h-9 rounded-lg border-2 text-xs"
                                            />
                                            <Select onValueChange={setResourceType} value={resourceType}>
                                                <SelectTrigger className="h-9 rounded-lg border-2 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="pdf">PDF File</SelectItem>
                                                    <SelectItem value="notes">Lecture Notes</SelectItem>
                                                    <SelectItem value="link">Reference Link</SelectItem>
                                                    <SelectItem value="video">Syllabus Video</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button 
                                                type="button" 
                                                onClick={handleAddResource}
                                                className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[9px] tracking-wider"
                                            >
                                                Add File
                                            </Button>
                                        </div>
                                        <Input 
                                            placeholder="Resource URL (e.g. cloud link / pdf link)" 
                                            value={resourceUrl} 
                                            onChange={(e) => setResourceUrl(e.target.value)}
                                            className="h-9 rounded-lg border-2 text-xs"
                                        />

                                        {addedResources.length > 0 && (
                                            <div className="pt-2 space-y-1">
                                                {addedResources.map((res, i) => (
                                                    <div key={i} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                                                        <span>• {res[0]} ({res[1]})</span>
                                                        <Button 
                                                            variant="ghost" 
                                                            type="button"
                                                            onClick={() => setAddedResources(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="text-red-500 h-5 px-1 hover:bg-transparent text-[10px] font-semibold"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={submitLoading}
                                        className="w-full h-12 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[10px]"
                                    >
                                        {submitLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Post Announcement"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Loading bulletin boards...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    <div className="space-y-6">
                        {announcements.map((ann) => {
                            const sub = subjects.find(s => s._id === ann.subjectId);
                            const commentsOpen = openComments[ann._id];
                            return (
                                <Card key={ann._id} className="rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 md:p-8 space-y-4">
                                        {/* feed Card Header */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                                    <Megaphone size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{ann.title}</h3>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        {ann.teacherName || "Course Instructor"} • {sub ? sub.title : ""} • {new Date(ann.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleToggleBookmark(ann._id)}
                                                className="rounded-xl"
                                            >
                                                {ann.isBookmarked 
                                                    ? <BookmarkCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                    : <Bookmark size={18} className="text-slate-400" />
                                                }
                                            </Button>
                                        </div>

                                        {/* Content */}
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                            {ann.content}
                                        </p>

                                        {/* Resources attachments */}
                                        {ann.resources && ann.resources.length > 0 && (
                                            <div className="pt-2 space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Attachments:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {ann.resources.map((res: any) => (
                                                        <a key={res._id} href={res.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-colors">
                                                            <Download size={12} />
                                                            {res.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Reaction and comments actions bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleToggleReaction(ann._id, "love")}
                                                    className={`h-9 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                                                        ann.reactions.includes("love") 
                                                            ? "bg-red-50 text-red-600 dark:bg-red-950/20" 
                                                            : "text-slate-400 hover:text-red-500"
                                                    }`}
                                                >
                                                    <Heart size={14} className={ann.reactions.includes("love") ? "fill-red-600" : ""} />
                                                    <span>{ann.reactions.filter(r => r === "love").length}</span>
                                                </Button>

                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => setOpenComments(prev => ({ ...prev, [ann._id]: !prev[ann._id] }))}
                                                    className="h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
                                                >
                                                    <MessageSquare size={14} />
                                                    <span>{ann.comments.length} Comments</span>
                                                </Button>
                                            </div>

                                            {/* AI action bar */}
                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">AI Copilot</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleAiFeature(ann._id, "summarize")}
                                                    className="h-7 text-[10px] font-extrabold uppercase tracking-wider rounded-lg px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <Sparkles size={10} className="mr-1" /> Summary
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleAiFeature(ann._id, "translate")}
                                                    className="h-7 text-[10px] font-extrabold uppercase tracking-wider rounded-lg px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <Languages size={10} className="mr-1" /> Translate
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleAiFeature(ann._id, "action-items")}
                                                    className="h-7 text-[10px] font-extrabold uppercase tracking-wider rounded-lg px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <CheckSquare size={10} className="mr-1" /> Tasks
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Comments Feed Panel */}
                                        {commentsOpen && (
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-1 duration-200">
                                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                                    {ann.comments.length > 0 ? (
                                                        ann.comments.map((c: any) => (
                                                            <div key={c._id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{c.userName}</span>
                                                                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{c.content}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No comments posted yet. Write one below!</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        placeholder="Write a comment..."
                                                        value={commentTexts[ann._id] || ""}
                                                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [ann._id]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === "Enter" && handlePostComment(ann._id)}
                                                        className="rounded-xl border-2 h-9 text-xs"
                                                    />
                                                    <Button 
                                                        size="icon"
                                                        onClick={() => handlePostComment(ann._id)}
                                                        className="w-9 h-9 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shrink-0"
                                                    >
                                                        <Send size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Megaphone className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter italic">Bulletin Board Empty</h3>
                        <p className="text-slate-400 dark:text-slate-500 mt-2 max-w-sm font-medium leading-relaxed">No subject bulletins have been published yet. Updates from teachers will show up here.</p>
                    </div>
                )}
            </div>

            {/* AI Assistant Output Dialog */}
            <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                <DialogContent className="rounded-[2rem] border-2 max-w-md bg-white dark:bg-slate-900 p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Sparkles size={18} className="animate-pulse" />
                            {aiTitle}
                        </DialogTitle>
                    </DialogHeader>

                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 animate-pulse">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Computing variables...</p>
                        </div>
                    ) : (
                        <div className="pt-4 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {aiResult}
                            </div>
                            <Button 
                                onClick={() => setAiOpen(false)}
                                className="w-full h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold uppercase text-[10px]"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </ClassroomLayout>
    );
}
