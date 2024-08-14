import { useState, useEffect } from 'react';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken='));
      setIsLoggedIn(!!authToken);
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  return isLoggedIn;
}