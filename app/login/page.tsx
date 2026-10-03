import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex-1">
      <h1 className="font-display text-[28px] leading-[35px]">Welcome to Kaizen</h1>
      <p className="mt-3 mb-8 text-text-secondary">
        Sign in to keep your steps safe and in sync.
      </p>
      <LoginForm />
    </main>
  );
}
