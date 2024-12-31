import React, { useState, useEffect } from 'react';
import { CalendarDays, CircleUser } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import Timetable from '../components/Timetable';

const Header = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
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
            {user ? (
              <div className="flex items-center gap-4">
                <a href="/monitoring" className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                  <CircleUser className="h-5 w-5" />
                  <span>{user.displayName}</span>
                </a>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:text-blue-500 hover:border-blue-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

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
