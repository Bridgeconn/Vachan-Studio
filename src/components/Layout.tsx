// src/components/Layout.tsx

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: Show login modal
    console.log('Login clicked');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('Logged out');
  };

  const handleNotificationsClick = () => {
    // TODO: Show notifications dropdown
    console.log('Notifications clicked');
  };

  const handleLogoClick = () => {
    navigate('/');  // Navigate to home using React Router!
  };

  const handleFeatureClick = (featureId: string) => {
    console.log('Feature clicked:', featureId);
    
    if (!isLoggedIn) {
      // TODO: Show login modal
      console.log('Need to login first');
      handleLogin();
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
      
      {/* This renders the current page (HomePage, STTPage, etc) */}
      <Outlet context={{ onFeatureClick: handleFeatureClick }} />
    </>
  );
}