"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, FieldLabel } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!email || !password) {
      setError("Enter an email and password to continue.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (!res || res.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 bg-cream px-10 py-28 sm:py-36">
      <div className="w-full max-w-sm border border-ink/16 bg-cream-card p-9">
        <div className="text-[13px] tracking-[0.32em] text-rust uppercase">Seller access</div>
        <h1 className="mt-3 mb-6 text-3xl font-light">Sign in</h1>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <FieldLabel>Email</FieldLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@paraillere.ph"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="mt-1.5 cursor-pointer rounded-sm bg-maroon px-5 py-4 text-[14px] tracking-[0.17em] text-cream uppercase"
          >
            {pending ? "Signing in…" : "Enter studio"}
          </button>
          <p
            className={
              "m-0 font-mono text-[13px] leading-loose " +
              (error ? "text-rust" : "text-ink/55")
            }
          >
            {error ?? "Sign in with the seller account you configured."}
          </p>
        </div>
      </div>
      <Link
        href="/"
        className="text-[13px] tracking-[0.15em] text-ink/55 uppercase hover:text-rust"
      >
        ← Back to store
      </Link>
    </div>
  );
}
