"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/app/action";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Note: HttpOnly cookie cannot be read by document.cookie.
    // If the user is at /login but already authenticated, middleware will redirect them.
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await authenticateUser(email, password);

    if (res.success) {
      router.push("/");
      router.refresh(); // Refresh to trigger middleware and update UI state
    } else {
      setError(res.error || "Email atau password salah.");
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex items-center justify-center p-4"
      style={{ background: "var(--black)", color: "var(--text-primary)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl space-y-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-visible)",
        }}
      >
        <div className="text-center space-y-2">
          <h1
            className="text-4xl font-bold font-display"
            style={{ color: "var(--text-display)" }}
          >
            sesaKu
          </h1>
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Kelola pengeluaranmu dengan cerdas.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label
              className="text-[12px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cubybot.net"
              className="w-full h-12 px-4 rounded-xl text-[14px] transition-all"
              style={{
                border: "1px solid var(--border-visible)",
                background: "var(--black)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              className="text-[12px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl text-[14px] transition-all"
              style={{
                border: "1px solid var(--border-visible)",
                background: "var(--black)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p className="text-[12px] text-center" style={{ color: "var(--accent)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-bold rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "white",
              border: "none",
              fontSize: "14px",
            }}
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
            © 2026 sesaKu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
