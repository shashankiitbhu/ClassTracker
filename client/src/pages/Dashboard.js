import React, { useState } from 'react';
import {CalendarDays, Home, CircleUser, Circle } from 'lucide-react';
import Timetable from '../components/Timetable';

const Header = () => (
  <header className="bg-white border-b">
    <nav className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold">ClassTracker</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/events" className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
            <CalendarDays className="h-5 w-5" />
            <span>Schedule</span>
          </a>
          <a href="/monitoring" className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
            <CircleUser className="h-5 w-5" />
            <span>Profile</span>
          </a>
        </div>
      </div>
    </nav>
  </header>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Timetable />
      </main>
    </div>
  );
};

export default Dashboard;
