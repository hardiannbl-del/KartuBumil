"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Stethoscope } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null; // or loading state, but mostly it's wrapped in layout that doesn't need to show if not logged in for this app design. Actually let's just render it always and hide buttons.
  }

  return (
    <nav className="bg-emerald-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-emerald-100" />
              <span className="font-bold text-xl tracking-tight">BidanKu</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-emerald-100 hidden md:block">
              Halo, {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
