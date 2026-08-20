import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function TeacherTimetable() {
  const schedule = [
    { time: '10:00 AM', subject: 'Data Structures', class: 'CSE Sem 3 Sec A', room: 'Room 101' },
    { time: '12:00 PM', subject: 'DBMS', class: 'CSE Sem 4 Sec B', room: 'Lab 2' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-white font-sans">
      <h1 className="text-2xl font-bold mb-6">My Teaching Schedule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Subjects</p>
              <p className="text-2xl font-bold mt-1">3</p>
            </div>
            <i className="bx bx-bookopen w-8 h-8 text-blue-400 opacity-50"  />
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Weekly Hours</p>
              <p className="text-2xl font-bold mt-1">16</p>
            </div>
            <i className="bx bx-clock w-8 h-8 text-emerald-400 opacity-50"  />
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Lab Hours</p>
              <p className="text-2xl font-bold mt-1">6</p>
            </div>
            <i className="bx bx-barchart w-8 h-8 text-purple-400 opacity-50"  />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-neutral-200">
              <i className="bx bx-calendar w-5 h-5 mr-2 text-blue-400"  /> Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.map((item, idx) => (
              <div key={idx} className="flex p-4 rounded-lg bg-neutral-800 border border-neutral-700 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm text-neutral-400">{item.time}</div>
                  <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-neutral-200">{item.subject}</h3>
                    <p className="text-sm text-neutral-400">{item.class} • {item.room}</p>
                  </div>
                </div>
                <button className="px-3 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 transition-colors">
                  Post Announcement
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
