"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";

export function ProfileButton() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>;

  if (!isAuthenticated || !user) return null;

  // Get initials for avatar
  const initials = user.username ? user.username.charAt(0).toUpperCase() : 'U'; 

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="User menu"
      >
        {initials}
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-2 px-4 border-b border-gray-100">
            <p className="text-sm font-medium">{user.username || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user.email || "No email"}</p>
          </div>
          
          <div className="py-1">
            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile
            </a>
            <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Dashboard
            </a>
            <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Settings
            </a>
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <button 
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
