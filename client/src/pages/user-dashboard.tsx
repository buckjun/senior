import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export default function UserDashboard() {
  const { isAuthenticated } = useAuth();

  // Check for existing profiles
  const { data: individualProfile } = useQuery({
    queryKey: ['/api/individual-profiles/me'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company-profiles/me'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Redirect based on existing profiles
  React.useEffect(() => {
    if (individualProfile) {
      window.location.href = '/individual/dashboard';
    } else if (companyProfile) {
      window.location.href = '/company/dashboard';
    } else {
      // No profile exists, show selection
      window.location.href = '/profile-selection';
    }
  }, [individualProfile, companyProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}