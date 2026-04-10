// src/components/Layout.tsx

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { LoginModal } from './LoginModal';
import { sseManager } from '@/services/sseManager';

export function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string) => {
    setIsLoggedIn(true);
    
    // Connect SSE for real-time notifications
    sseManager.connect(token);
    
    // If user was trying to access a feature, navigate to it
    if (pendingFeature) {
      navigate(`/${pendingFeature}`);
      setPendingFeature(null);
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    
    // Disconnect SSE
    sseManager.disconnect();
    
    // Navigate to home
    navigate('/');
    
    console.log('Logged out');
  };

  const handleNotificationsClick = () => {
    // TODO: Show notifications dropdown
    console.log('Notifications clicked');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleFeatureClick = (featureId: string) => {
    console.log('Feature clicked:', featureId);
    
    if (!isLoggedIn) {
      // Save which feature they wanted
      setPendingFeature(featureId);
      // Show login modal
      setIsLoginModalOpen(true);
    } else {
      // Navigate to feature page
      navigate(`/${featureId}`);
    }
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onNotificationsClick={handleNotificationsClick}
        onLogoClick={handleLogoClick}
      />
      
      <Outlet context={{ onFeatureClick: handleFeatureClick }} />
      
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}