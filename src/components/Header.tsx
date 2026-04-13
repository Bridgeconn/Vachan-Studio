// src/components/Header.tsx

import { Moon, Sun, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onNotificationsClick: () => void;
  onLogoClick: () => void;  // ← Add this line
}

export function Header({ 
  isLoggedIn, 
  onLoginClick, 
  onLogoutClick,
  onNotificationsClick,
  onLogoClick,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // For demo

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
  <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI UI</h1>
            <p className="text-xs text-muted-foreground">AI Feature Showcase</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* About */}
          <Button variant="ghost" size="sm">
            About
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications / Files */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNotificationsClick}
              title="View outputs"
            >
              <FileText className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </div>

          {/* Login/Logout */}
          {isLoggedIn ? (
            <Button 
              variant="default" 
              size="sm"
              onClick={onLogoutClick}
            >
              Logout
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={onLoginClick}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}