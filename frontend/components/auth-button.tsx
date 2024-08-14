'use client';

import { useState, useEffect } from 'react';
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

export const AuthButton = ({ initialIsLoggedIn }: { initialIsLoggedIn: boolean }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken='));
      setIsLoggedIn(!!authToken);
    };

    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  if (isLoggedIn) {
    return (
      <form action="/api/logout" method="POST">
        <Button
          type="submit"
          className="text-sm font-normal text-default-600 bg-default-100"
          variant="flat"
        >
          Logout
        </Button>
      </form>
    );
  } else {
    return (
      <Link href="/login">
        <Button
          className="text-sm font-normal text-default-600 bg-default-100"
          variant="flat"
        >
          Login
        </Button>
      </Link>
    );
  }
};
