"use client";

import { Button, Input, Card, CardBody, CardHeader, Link } from "@nextui-org/react";
import { useState } from "react";
import { api } from "../service/restful";
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      let response;
      if (isLogin) {
        response = await api.signin(username, password);
      } else {
        response = await api.signup(username, password);
      }
      console.log(response);

      if (response.status === 200) {
        if (isLogin && response.data.token) {
          console.log("Login successful!");
          router.push('/board'); // Redirect to the board page
        } else if (!isLogin) {
          console.log("Registration successful!");
          setMessage("Registration successful! Please login.");
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        setError(response.error || `${isLogin ? "Login" : "Registration"} failed. Please check your credentials.`);
      }
    } catch (err) {
      console.error(`${isLogin ? "Login" : "Registration"} error:`, err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader className="flex justify-center">
        <h2 className="text-2xl font-bold">{isLogin ? "Login" : "Register"}</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {!isLogin && (
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
          <Button type="submit" color="primary" fullWidth>
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
