"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, Dices, Trophy, MapPin } from "lucide-react";

interface UserDoc {
  id: string;
  email: string;
  scores: { id: string, date: string, number: number }[];
  selectedCharity: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawResult, setDrawResult] = useState<{ drawn: number[], winners: { email: string, matches: number }[] } | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList: UserDoc[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as UserDoc);
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const runGlobalDraw = () => {
    // Generate 5 numbers
    const drawnNumbers = new Set<number>();
    while (drawnNumbers.size < 5) {
      drawnNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const drawnArray = Array.from(drawnNumbers);

    const winners: { email: string, matches: number }[] = [];

    users.forEach(u => {
      const userNumbers = u.scores?.map(s => s.number) || [];
      let matchCount = 0;
      userNumbers.forEach(n => {
        if (drawnArray.includes(n)) matchCount++;
      });
      
      if (matchCount > 0) {
        winners.push({ email: u.email || "Unknown User", matches: matchCount });
      }
    });

    // Sort winners by matches descending
    winners.sort((a, b) => b.matches - a.matches);

    setDrawResult({ drawn: drawnArray, winners });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Admin Control Panel
            </h1>
            <p className="text-gray-500">Manage users and run system draws</p>
          </div>
          <button 
            onClick={runGlobalDraw}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm flex items-center gap-2"
          >
            <Dices className="w-5 h-5"/>
            Run Global Draw
          </button>
        </div>

        {drawResult && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Global Draw Results</h2>
            <div className="flex gap-3 justify-center mb-8">
              {drawResult.drawn.map((n, i) => (
                <span key={i} className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xl text-indigo-700 shadow-sm">
                  {n}
                </span>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Winners ({drawResult.winners.length})
              </h3>
              {drawResult.winners.length === 0 ? (
                <p className="text-gray-500 italic">No matches from any user.</p>
              ) : (
                <ul className="space-y-2">
                  {drawResult.winners.map((w, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-800">{w.email}</span>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {w.matches} Matches
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Registered Users ({users.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-6 flex justify-between items-start hover:bg-gray-50/50 transition">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{user.email || "No Email Provided"}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      {user.selectedCharity || "No charity selected"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      {user.scores?.length || 0} scores
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
