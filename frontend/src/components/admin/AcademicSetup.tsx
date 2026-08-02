"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export function AcademicSetup() {
  const [activeTab, setActiveTab] = useState('hierarchy');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <i className="bx bx-layers"  />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Academic Setup</h1>
          </div>
          <p className="text-white/60 text-sm font-medium">Configure hierarchy and map faculty to subjects before timetable generation.</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-white/10 hover:bg-white/20 text-white font-bold py-6 px-6 rounded-xl uppercase tracking-widest text-xs border border-white/10 transition-colors">
            <i className="bx bx-save w-4 h-4 mr-2"  /> Save Configuration
          </Button>
        </div>
      </div>

      <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 w-fit">
        <button 
          onClick={() => setActiveTab('hierarchy')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'hierarchy' ? 'bg-accent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          Academic Hierarchy
        </button>
        <button 
          onClick={() => setActiveTab('faculty')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'faculty' ? 'bg-accent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          Faculty Assignments
        </button>
      </div>

      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center text-white uppercase tracking-widest">
                <i className="bx bx-building w-4 h-4 mr-2 text-accent"  /> Branches
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white bg-white/5 rounded-lg"><i className="bx bx-plus"  /></Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold">Computer Science (CSE)</div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold">Information Tech (IT)</div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center text-white uppercase tracking-widest">
                <i className="bx bx-clock w-4 h-4 mr-2 text-blue-400"  /> Semesters
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white bg-white/5 rounded-lg"><i className="bx bx-plus"  /></Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold flex justify-between">
                <span>Semester 3</span>
                <span className="text-xs text-white/40 uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Active</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold flex justify-between">
                <span>Semester 5</span>
                <span className="text-xs text-white/40 uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center text-white uppercase tracking-widest">
                <i className="bx bx-group w-4 h-4 mr-2 text-orange-400"  /> Sections
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white bg-white/5 rounded-lg"><i className="bx bx-plus"  /></Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold flex justify-between items-center">
                <span>Section A</span>
                <div className="text-xs text-white/40 font-medium">Cap: 60</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-white font-bold flex justify-between items-center">
                <span>Section B</span>
                <div className="text-xs text-white/40 font-medium">Cap: 60</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'faculty' && (
        <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/10 pb-6 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center text-white uppercase tracking-widest">
              Assign Faculty to Subjects
            </CardTitle>
            <Button className="bg-accent text-white hover:bg-accent/80 rounded-xl font-bold">
              <i className="bx bx-plus w-4 h-4 mr-2"  /> New Assignment
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-black text-white/40 uppercase tracking-widest">
              <div>Faculty</div>
              <div>Subject</div>
              <div>Section</div>
              <div>Actions</div>
            </div>
            
            {/* Mock Data Rows */}
            <div className="grid grid-cols-4 gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">DS</div>
                <div className="font-bold text-white">Dr. Sharma</div>
              </div>
              <div className="font-bold text-white/80">Data Structures</div>
              <div className="text-sm text-white/60">CSE - Sem 3 - Sec A</div>
              <div>
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white bg-white/5">Edit</Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">KP</div>
                <div className="font-bold text-white">Prof. K. Patel</div>
              </div>
              <div className="font-bold text-white/80">Digital Logic</div>
              <div className="text-sm text-white/60">CSE - Sem 3 - Sec A</div>
              <div>
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white bg-white/5">Edit</Button>
              </div>
            </div>
            
            {/* Blank row for adding new */}
            <div className="grid grid-cols-4 gap-4 items-center bg-accent/5 p-4 rounded-xl border border-accent/20 border-dashed mt-6">
              <div>
                <Select>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-lg"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent><SelectItem value="t1">Dr. Sharma</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Select>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-lg"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent><SelectItem value="s1">Computer Networks</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Select>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-lg"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent><SelectItem value="sec1">Section B</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Button className="w-full bg-accent hover:bg-accent/80 text-white rounded-lg font-bold">Save Assignment</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
