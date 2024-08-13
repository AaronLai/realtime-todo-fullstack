import { title } from "@/components/primitives";
import dynamic from 'next/dynamic';

// Dynamically import the client-side component
const AuthForm = dynamic(() => import('../../components/auth-form'), { ssr: false });

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-start w-full">
      <h1 className={title({ color: "violet" })}>Authentication</h1>
      <AuthForm />
    </div>
  );
}