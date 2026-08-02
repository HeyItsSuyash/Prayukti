import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function StudentTimetable() {
  const schedule = [
    { time: '09:00 AM', subject: 'Mathematics', faculty: 'Dr. R. Kumar', isLab: false },
    { time: '10:00 AM', subject: 'Data Structures', faculty: 'Dr. Sharma', isLab: false },
    { time: '02:00 PM', subject: 'Data Structures Lab', faculty: 'Dr. Sharma', isLab: true },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-white font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Timetable</h1>
        <p className="text-neutral-400 mt-1">B.Tech • CSE • Sem 3 • Section A</p>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-neutral-200">
            <i className="bx bx-calendar w-5 h-5 mr-2 text-emerald-400"  /> Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-neutral-800 border border-neutral-700 gap-4">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm text-neutral-400 whitespace-nowrap">{item.time}</div>
                <div className={`w-1 h-12 rounded-full ${item.isLab ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-neutral-200 text-lg">{item.subject}</h3>
                  <p className="text-sm text-neutral-400">{item.faculty}</p>
                </div>
              </div>
              <div className="flex gap-2 ml-[80px] md:ml-0">
                <button className="flex items-center px-3 py-1.5 text-xs font-medium rounded border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <i className="bx bx-bot w-3 h-3 mr-1.5"  /> Ask AI Tutor
                </button>
                {item.isLab && (
                  <button className="flex items-center px-3 py-1.5 text-xs font-medium rounded border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-colors">
                    <i className="bx bx-beaker w-3 h-3 mr-1.5"  /> Open Virtual Lab
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
