"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PhoneNumberModal from '@/components/auth/PhoneNumberModal';

type UserRole = 'user' | 'admin';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  image?: string;
  needsPhoneUpdate?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  updatePhoneNumber: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      const userData: User = {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email,
        phone: session.user.phone,
        role: (session.user.role as UserRole) || 'user',
        image: session.user.image,
        needsPhoneUpdate: session.user.needsPhoneUpdate
      };
      setUser(userData);
      
      // Show phone modal if needed
      if (userData.needsPhoneUpdate) {
        setShowPhoneModal(true);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [session, status]);

  const updatePhoneNumber = async (phone: string) => {
    try {
      const response = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to update phone number');
      }

      // Update session to reflect changes
      await update({
        ...session,
        user: {
          ...session?.user,
          phone,
          needsPhoneUpdate: false
        }
      });
      
      // Update local state
      setUser(prev => prev ? { ...prev, phone, needsPhoneUpdate: false } : null);
      
      // Hide modal
      setShowPhoneModal(false);
      
      // Refresh page to ensure all components have latest data
      router.refresh();
    } catch (error) {
      console.error('Error updating phone number:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, updatePhoneNumber }}>
      {children}
      {showPhoneModal && (
        <PhoneNumberModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSubmit={updatePhoneNumber}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
