import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-[#191A2C] border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/2387b80a-9a17-438a-a185-e83b5029bfb0-logo-removebg-preview.png" 
              alt="CampusPal Logo" 
              className="h-8 w-auto"
            />
            <span className="font-orbitron text-xl font-bold text-[#A9E627]">CampusPal</span>
          </Link>
          
          {user && (
            <button onClick={handleSignOut} className="btn btn-secondary flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}