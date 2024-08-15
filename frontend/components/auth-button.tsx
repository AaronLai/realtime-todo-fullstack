'use client';

import { useState, useEffect } from 'react';
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

// AuthButton component that displays either a Login or Logout button based on authentication status
export const AuthButton = ({ initialIsLoggedIn }: { initialIsLoggedIn: boolean }) => {
  // State to keep track of the user's login status
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    // Function to check the authentication status
    const checkAuthStatus = () => {
      // Check for the presence of an authToken in the cookies
      const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken='));
      // Update the login state based on the presence of the authToken
      setIsLoggedIn(!!authToken);
    };

    // Add an event listener for the 'storage' event to detect changes in local storage
    // This can be used to sync login state across tabs
    window.addEventListener('storage', checkAuthStatus);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  // Render the Logout button if the user is logged in
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
    // Render the Login button if the user is not logged in
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
