import React, { useState, useEffect } from 'react';
import { API_URL } from "@/lib/config";
import { Plus, Save, Calendar as CalendarIcon, Clock, Users, BookOpen, AlertTriangle, Zap, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function AdminTimetableBuilder() {
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("3");
  const [selectedSection, setSelectedSection] = useState("A");

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [slots, setSlots] = useState<any[]>([]);

  // Fetched Data State
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Manual Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState<{ day: string; time: string } | null>(null);
  const [newSlot, setNewSlot] = useState({ subject: '', faculty: '', room: '', type: 'lecture' });

  useEffect(() => {
    fetchInitialData();
  }, [selectedBranch, selectedSemester]);

  const fetchInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [subjRes, userRes] = await Promise.all([
        fetch(`${API_URL}/api/subjects?branch=${selectedBranch}&semester=${selectedSemester}`),
        fetch(`${API_URL}/api/users`)
      ]);
      if (subjRes.ok) setDbSubjects(await subjRes.json());
      if (userRes.ok) {
        const users = await userRes.json();
        // Fallback to all users if no teachers found for testing, otherwise filter
        const teachers = users.filter((u: any) => u.role === 'teacher' || u.role === 'admin');
        setDbTeachers(teachers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(1); 
    
    setTimeout(() => setGenerationStep(2), 1000); 
    setTimeout(() => setGenerationStep(3), 2000); 

    try {
      const token = localStorage.getItem('vlab_token');
      const payload = {
        institution_id: "00000000-0000-0000-0000-000000000000",
        section_ids: ["00000000-0000-0000-0000-000000000000"]
      };

      const res = await fetch(`${API_URL}/api/timetable/auto-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to generate timetable");
      const data = await res.json();
      
      setTimeout(() => {
        // Only keep generated slots that don't overlap with manually assigned ones
        const newSlots = [...slots];
        data.generated_slots.forEach((gSlot: any) => {
          if (!newSlots.find(s => s.day === gSlot.day && s.time === gSlot.time)) {
            newSlots.push(gSlot);
          }
        });
        setSlots(newSlots);
        setIsGenerating(false);
        setGenerationStep(4);
      }, 3000);

    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setGenerationStep(0);
      alert("Failed to auto-generate timetable.");
    }
  };

  const openManualModal = (day: string, time: string) => {
    setModalSlot({ day, time });
    setNewSlot({ subject: '', faculty: '', room: '', type: 'lecture' });
    setIsModalOpen(true);
  };

  const handleSaveManualSlot = () => {
    if (!modalSlot || !newSlot.subject || !newSlot.faculty) return;
    
    // Remove existing slot in that time if any, then add new
    const updatedSlots = slots.filter(s => !(s.day === modalSlot.day && s.time === modalSlot.time));
    updatedSlots.push({
      day: modalSlot.day,
      time: modalSlot.time,
      ...newSlot
    });
    setSlots(updatedSlots);
    setIsModalOpen(false);
  };

  const handleRemoveSlot = (day: string, time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots(slots.filter(s => !(s.day === day && s.time === time)));
  };

  const headerTitle = `B.Tech > ${selectedBranch} > Sem ${selectedSemester} > Section ${selectedSection}`;

  return (
    <div className="max-w-7xl mx-auto h-full text-slate-100 font-sans space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <CalendarIcon size={20} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Timetable Generator</h1>
          </div>
          <p className="text-white/60 text-sm font-medium">Auto-generate or manually override schedules across the institution.</p>
        </div>
        
        {/* Dynamic Class Selectors */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[120px] bg-slate-900 border-white/10 text-white font-bold rounded-xl">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[120px] bg-slate-900 border-white/10 text-white font-bold rounded-xl">
              <SelectValue placeholder="Sem" />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[120px] bg-slate-900 border-white/10 text-white font-bold rounded-xl">
              <SelectValue placeholder="Sec" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Sec A</SelectItem>
              <SelectItem value="B">Sec B</SelectItem>
              <SelectItem value="C">Sec C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className={`font-bold py-6 px-6 rounded-xl uppercase tracking-widest text-xs transition-all shadow-xl
              ${isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 text-white shadow-accent/20'}`}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Auto-Generate</>
            )}
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white font-bold py-6 px-6 rounded-xl uppercase tracking-widest text-xs border border-white/10 transition-colors">
            <Save className="w-4 h-4 mr-2" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Info Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-sm font-bold flex items-center text-white uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 mr-2 text-accent" /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${generationStep >= 1 ? 'text-white' : 'text-white/30'}`}>
                    {generationStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <RefreshCw className="w-4 h-4 animate-spin text-accent" />}
                    <span className="text-xs font-bold uppercase tracking-widest">Analyzing Constraints</span>
                  </div>
                  <div className={`flex items-center gap-3 ${generationStep >= 2 ? 'text-white' : 'text-white/30'}`}>
                    {generationStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : (generationStep === 2 ? <RefreshCw className="w-4 h-4 animate-spin text-accent" /> : <div className="w-4 h-4 rounded-full border-2 border-white/20" />)}
                    <span className="text-xs font-bold uppercase tracking-widest">Mapping Faculty</span>
                  </div>
                  <div className={`flex items-center gap-3 ${generationStep >= 3 ? 'text-white' : 'text-white/30'}`}>
                    {generationStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : (generationStep === 3 ? <RefreshCw className="w-4 h-4 animate-spin text-accent" /> : <div className="w-4 h-4 rounded-full border-2 border-white/20" />)}
                    <span className="text-xs font-bold uppercase tracking-widest">Optimizing Schedule</span>
                  </div>
                </div>
              ) : slots.length > 0 ? (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Generated & Loaded</h3>
                    <p className="text-xs text-white/60">Ready to publish. You can manually click any slot to override.</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/50 leading-relaxed font-medium">
                  The schedule is empty. Click "Auto-Generate" or click any empty slot in the timetable to manually assign a class.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center text-white uppercase tracking-widest">
                <BookOpen className="w-4 h-4 mr-2 text-blue-400" /> Subjects
              </CardTitle>
              <span className="text-xs font-black bg-white/10 px-2 py-1 rounded text-white/60">
                {selectedBranch} S{selectedSemester}
              </span>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {isLoadingData ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-accent" /></div>
              ) : dbSubjects.length === 0 ? (
                <div className="text-center text-xs text-white/40 italic p-4">No subjects found for this semester.</div>
              ) : (
                dbSubjects.map((sub: any) => (
                  <div key={sub._id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <div className="font-bold text-white text-sm">{sub.title || sub.name || 'Unnamed'}</div>
                    <div className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">{sub.subject_id || sub.code || 'NO-CODE'}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-9">
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl h-full overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center border-b border-white/10 pb-6 bg-white/5">
              <CardTitle className="text-lg font-bold flex items-center text-white uppercase tracking-widest">
                {headerTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-6 border-b border-white/5 bg-slate-900/50">
                  <div className="p-4 text-center text-xs font-black uppercase tracking-widest text-white/50 border-r border-white/5">Time</div>
                  {days.map(day => (
                    <div key={day} className="p-4 text-center text-xs font-black uppercase tracking-widest text-white/80 border-r border-white/5 last:border-0">{day}</div>
                  ))}
                </div>
                
                {isGenerating ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-sm font-bold text-white/60 uppercase tracking-widest animate-pulse">Running Constraint Solver...</p>
                    </div>
                  </div>
                ) : (
                  times.map(time => (
                    <div key={time} className="grid grid-cols-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <div className="p-4 text-center text-xs font-bold text-white/40 border-r border-white/5 flex items-center justify-center">
                        <Clock className="w-3 h-3 mr-1"/> {time}
                      </div>
                      {days.map(day => {
                        const slot = slots.find(s => s.day === day && s.time === time);
                        return (
                          <div 
                            key={`${day}-${time}`} 
                            className="p-2 border-r border-white/5 last:border-0 min-h-[110px] cursor-pointer"
                            onClick={() => openManualModal(day, time)}
                          >
                            {slot ? (
                              <div className={`h-full rounded-xl p-3 border group relative transition-all shadow-lg ${
                                slot.type === 'lab' 
                                  ? 'bg-purple-500/20 border-purple-500/40 hover:border-purple-500/60' 
                                  : 'bg-accent/20 border-accent/40 hover:border-accent/60'
                              }`}>
                                <div className="font-bold text-white text-xs mb-1">{slot.subject}</div>
                                <div className="text-[10px] text-white/80 font-medium">{slot.faculty}</div>
                                <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/60 bg-slate-900/50 px-2 py-0.5 rounded">
                                  {slot.room}
                                </div>
                                <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-xl ${slot.type === 'lab' ? 'bg-purple-500/80' : 'bg-accent/80'}`} />
                                <button 
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-opacity"
                                  onClick={(e) => handleRemoveSlot(day, time, e)}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/5 border border-white/10 hover:border-accent/50 group">
                                <Plus className="w-5 h-5 text-accent/50 group-hover:text-accent group-hover:scale-125 transition-transform" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Slot Assignment Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-white">Assign Class</DialogTitle>
            <p className="text-xs text-white/50">{modalSlot?.day} at {modalSlot?.time}</p>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Subject</Label>
              <Select value={newSlot.subject} onValueChange={v => setNewSlot({...newSlot, subject: v})}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {dbSubjects.map((s: any) => (
                    <SelectItem key={s._id} value={s.title || s.name || 'Unknown'}>{s.title || s.name || 'Unknown'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Faculty</Label>
              <Select value={newSlot.faculty} onValueChange={v => setNewSlot({...newSlot, faculty: v})}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {dbTeachers.map((t: any) => (
                    <SelectItem key={t._id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Room</Label>
                <Input 
                  placeholder="e.g. 101" 
                  value={newSlot.room}
                  onChange={e => setNewSlot({...newSlot, room: e.target.value})}
                  className="bg-slate-800 border-white/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/60">Type</Label>
                <Select value={newSlot.type} onValueChange={v => setNewSlot({...newSlot, type: v})}>
                  <SelectTrigger className="bg-slate-800 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="lab">Lab Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveManualSlot} className="bg-accent hover:bg-accent/90 text-white font-bold px-6">Save Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
