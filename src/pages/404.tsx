"use client";

import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center space-y-8">
          {/* 404 Number */}
          <div className="relative">
            <div className="text-9xl font-bold text-slate-200 dark:text-slate-800 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🔍</div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-balance">
              Page Not Found
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-balance">
              Oops! The page you're looking for seems to have wandered off into
              the digital void.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Home size={20} />
              Home
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 opacity-50">
          <div className="h-24 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg transform -rotate-6"></div>
          <div className="h-24 bg-linear-to-br from-purple-400 to-purple-600 rounded-lg transform rotate-3"></div>
          <div className="h-24 bg-linear-to-br from-pink-400 to-pink-600 rounded-lg transform -rotate-3"></div>
        </div>
      </div>
    </div>
  );
}
