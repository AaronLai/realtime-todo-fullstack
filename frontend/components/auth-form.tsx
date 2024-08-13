// components/AuthForm.tsx
"use client";

import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import { useState } from "react";
import { api } from "../service/restful";

export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.signin(username, password);
      console.log(response);

      if (response.status === 200 && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        console.log("Login successful!");
        // You can redirect the user or update the UI here
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader className="flex justify-center">
        <h2 className="text-2xl font-bold">Login</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="text"
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
