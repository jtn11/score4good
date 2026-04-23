import Link from "next/link";
import { ArrowRight, Activity, Gift, HeartHandshake } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      
      {/* Navbar */}
      <nav className="w-full bg-white bg-opacity-70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Score4Good
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Log in
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Track Performance. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Win Rewards. Support Charity.
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A modern platform that turns your performance tracking into a fun lottery game. Play your scores, win rewards, and seamlessly donate to causes you care about.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Tracking Now <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full mt-32">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Track Scores</h3>
            <p className="text-gray-500 text-sm">Keep up to 5 strategic scores across any competitive domain.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Win Rewards</h3>
            <p className="text-gray-500 text-sm">Participate in draws to match your numbers and win prizes.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Support Charity</h3>
            <p className="text-gray-500 text-sm">Direct your wins to supported charities worldwide.</p>
          </div>
        </div>
      </main>

    </div>
  );
}
