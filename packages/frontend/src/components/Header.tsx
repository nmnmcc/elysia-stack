"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (showAuth === "register") {
      await authClient.signUp.email({ email, password, name });
    } else {
      await authClient.signIn.email({ email, password });
    }
    setShowAuth(null);
    setEmail("");
    setPassword("");
    setName("");
    router.refresh();
  }

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-2.5">
        <Link className="shrink-0 text-lg font-semibold" href="/">
          elysia-stack
        </Link>

        <div className="flex-1" />

        {session ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-muted-foreground text-sm">{session.user.name}</span>
            <button
              className="text-muted-foreground hover:text-foreground text-sm"
              onClick={() => authClient.signOut().then(() => router.refresh())}
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="text-muted-foreground hover:text-foreground text-sm"
              onClick={() => setShowAuth(showAuth === "login" ? null : "login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium"
              onClick={() => setShowAuth(showAuth === "register" ? null : "register")}
              type="button"
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      {showAuth && (
        <div className="border-t">
          <form className="mx-auto flex w-full max-w-sm flex-col gap-3 px-4 py-4" onSubmit={handleSubmit}>
            {showAuth === "register" && (
              <input
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                type="text"
                value={name}
              />
            )}
            <input
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
            <input
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
            <button
              className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium"
              type="submit"
            >
              {showAuth === "register" ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
