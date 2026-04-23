"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, Edit2, PlayCircle, Heart } from "lucide-react";

interface Score {
  id: string;
  date: string;
  number: number;
  createdAt: number;
}

const CHARITIES = ["Red Cross", "UNICEF", "World Wildlife Fund", "Doctors Without Borders"];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [inputNumber, setInputNumber] = useState<string>("");
  const [inputDate, setInputDate] = useState<string>("");
  
  // Draw State
  const [drawResult, setDrawResult] = useState<{ drawn: number[], matchedCount: number } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setScores(data.scores || []);
          setSelectedCharity(data.selectedCharity || "");
        } else {
          // Initialize user doc
          await setDoc(docRef, { email: user.email, scores: [], selectedCharity: "" });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load user data");
      } finally {
        setLoadingData(false);
      }
    };
    fetchUserData();
  }, [user]);

  const saveScoresToDB = async (newScores: Score[]) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { scores: newScores });
    setScores(newScores);
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputNumber);
    
    // Validation
    if (isNaN(num) || num < 1 || num > 45) {
      toast.error("Invalid score: must be between 1 and 45");
      return;
    }
    if (scores.some((s) => s.date === inputDate)) {
      toast.error("duplicate date");
      return;
    }

    let updatedScores = [...scores];
    
    // Max 5 check and delete oldest
    if (updatedScores.length >= 5) {
      // Sort to find the oldest by createdAt
      updatedScores.sort((a, b) => a.createdAt - b.createdAt);
      updatedScores.shift(); // Remove oldest
    }

    const newScore: Score = {
      id: Math.random().toString(36).substr(2, 9),
      date: inputDate,
      number: num,
      createdAt: Date.now(),
    };

    updatedScores = [newScore, ...updatedScores].sort((a, b) => b.createdAt - a.createdAt);

    try {
      await saveScoresToDB(updatedScores);
      toast.success("Score added successfully");
      setInputNumber("");
      setInputDate("");
    } catch (error) {
      toast.error("Error adding score");
    }
  };

  const handleDeleteScore = async (id: string) => {
    const updatedScores = scores.filter((s) => s.id !== id);
    try {
      await saveScoresToDB(updatedScores);
      toast.success("Score deleted");
    } catch (error) {
      toast.error("Error deleting score");
    }
  };

  const simulateDraw = () => {
    const drawnNumbers = new Set<number>();
    while (drawnNumbers.size < 5) {
      drawnNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    const drawnArray = Array.from(drawnNumbers);
    const userNumbers = scores.map(s => s.number);
    let matches = 0;
    
    userNumbers.forEach(n => {
      if (drawnArray.includes(n)) matches++;
    });

    setDrawResult({ drawn: drawnArray, matchedCount: matches });
  };

  const handleSelectCharity = async (charity: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { selectedCharity: charity });
      setSelectedCharity(charity);
      toast.success("Charity updated");
    } catch (error) {
      toast.error("Error updating charity");
    }
  };

  if (loadingData) return null; // Let the wrapper handle splash loading if needed

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="text-gray-500">Subscription Status</p>
              <p className="font-semibold text-green-600">Active</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500">Next Draw</p>
              <p className="font-semibold text-blue-600">This Month</p>
            </div>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700 transition">
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Manage Scores
            </h2>

            <form onSubmit={handleAddScore} className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="date"
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  required
                  min="1"
                  max="45"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  placeholder="Score (1-45)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={scores.length >= 5 && false} // we auto-delete 6th
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Add
              </button>
            </form>

            <div className="flex-1">
              {scores.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No scores yet. Add your first score.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition hover:shadow-md">
                      <div>
                        <p className="font-medium text-gray-900">{score.date}</p>
                        <p className="text-sm text-gray-500">Score: {score.number}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setInputDate(score.date);
                            setInputNumber(score.number.toString());
                            handleDeleteScore(score.id);
                          }}
                          className="text-gray-400 hover:text-blue-500 transition p-2"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScore(score.id)}
                          className="text-gray-400 hover:text-red-500 transition p-2"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {scores.length === 5 && (
                    <p className="text-xs text-orange-500 mt-2 text-center">
                      Maximum 5 scores reached. Adding another will remove the oldest.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Draw Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-500" />
                Simulate Draw
              </h2>
              
              <button
                onClick={simulateDraw}
                disabled={scores.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                {scores.length === 0 ? "Add scores to play" : "Simulate Draw"}
              </button>

              {drawResult && (
                <div className="mt-6 p-5 bg-indigo-50 rounded-xl border border-indigo-100 text-center animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-indigo-600 font-medium mb-2">Drawn Numbers</p>
                  <div className="flex gap-2 justify-center mb-4">
                    {drawResult.drawn.map((n, i) => (
                      <span key={i} className="w-10 h-10 rounded-full bg-white border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 shadow-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {drawResult.matchedCount > 0 
                      ? `You matched ${drawResult.matchedCount} numbers 🎉` 
                      : "No match this time 😢"}
                  </h3>
                </div>
              )}
            </div>

            {/* Charity Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Support a Charity
              </h2>
              
              <div className="space-y-3">
                {CHARITIES.map(charity => (
                  <label key={charity} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${selectedCharity === charity ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <span className={`font-medium ${selectedCharity === charity ? 'text-rose-700' : 'text-gray-700'}`}>
                      {charity}
                    </span>
                    <input
                      type="radio"
                      name="charity"
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                      checked={selectedCharity === charity}
                      onChange={() => handleSelectCharity(charity)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
