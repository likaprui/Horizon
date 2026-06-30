import { useState } from "react";
import { LogOut, ChevronRight } from "lucide-react";

/* ─── shared input style ─── */
const inp =
  "w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition";
const lbl = "text-xs text-[#8b949e] block mb-1 font-medium";

/* ─── left decorative banner (reused on Login + Register) ─── */
function AuthBanner({ glowColor = "blue", children }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#090d13] p-12 flex-col justify-between border-r border-[#21262d] relative overflow-hidden">
      <div
        className={`absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-${glowColor}-600 opacity-10 blur-[120px] rounded-full`}
      />
      <Logo />
      <div className="max-w-md my-auto space-y-4">{children}</div>
      <div className="text-[11px] text-[#8b949e]">© 2026 QuantumTrader Platform Inc.</div>
    </div>
  );
}

function Logo() {
  return (
    <div className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
      <div className="w-5 h-5 bg-blue-500 rounded rotate-45 flex items-center justify-center">
        <div className="w-2 h-2 bg-[#090d13] rounded" />
      </div>
      QuantumTrader
    </div>
  );
}

/* ─── LOGIN ─── */
export function LoginScreen({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.username,
          password: form.password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setErrorMsg("Success! Loading dashboard...");
        setTimeout(() => onLogin(data.user || { username: form.username, balance: 10000 }), 800);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.detail;
        setErrorMsg(typeof msg === "string" ? msg : "Incorrect username or password");
      }
    } catch {
      /* ─── demo mode: ბექენდი გამორთულია ─── */
      setErrorMsg("Success! Loading dashboard...");
      setTimeout(
        () => onLogin({ username: form.username || "trader", balance: 10000 }),
        800
      );
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = errorMsg.includes("Success");

  return (
    <div className="min-h-screen flex animate-fadeIn">
      <AuthBanner glowColor="blue">
        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
          Trade smarter<br />with AI insights
        </h1>
        <p className="text-[#8b949e] text-sm leading-relaxed">
          Practice trading with $10,000 virtual capital.<br />Real market data, AI-powered signals.
        </p>
      </AuthBanner>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0d1117]">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>

          {errorMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold border ${
                isSuccess
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className={lbl}>Username or Email</label>
              <input
                type="text" required className={inp} placeholder="Username or Email"
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <input
                type="password" required className={inp} placeholder="Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2 px-4 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold rounded-lg text-sm transition mt-2 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center">
            <button onClick={onGoRegister} className="text-xs text-[#58a6ff] hover:underline bg-transparent border-none cursor-pointer">
              New to QuantumTrader? Create a free account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── REGISTER ─── */
export function RegisterScreen({ onSuccess, onGoLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "Registration failed. Try again.");
      }
    } catch {
      /* ─── demo mode ─── */
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      <AuthBanner glowColor="emerald">
        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
          Your $10,000<br />trading journey<br />starts here
        </h1>
      </AuthBanner>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0d1117]">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className={lbl}>Username</label>
              <input
                type="text" required className={inp} placeholder="@username"
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl}>Email address</label>
              <input
                type="email" required className={inp} placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <input
                type="password" required minLength={8} className={inp} placeholder="Min. 8 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2 px-4 bg-[#238636] hover:bg-[#2ea44f] text-white font-semibold rounded-lg text-sm transition mt-2 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create account — get $10,000"}
            </button>
          </form>

          <div className="text-center">
            <button onClick={onGoLogin} className="text-xs text-[#58a6ff] hover:underline bg-transparent border-none cursor-pointer">
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUCCESS ─── */
export function SuccessScreen({ onGoLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] p-6 animate-fadeIn">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-4xl font-bold flex items-center justify-center rounded-full mx-auto shadow-xl shadow-emerald-950/20">
          ✓
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Account created!</h1>
        <p className="text-sm text-[#8b949e] leading-relaxed">
          Welcome to QuantumTrader. Your $10,000 virtual balance is ready.
        </p>
        <button
          onClick={onGoLogin}
          className="w-full py-2 px-4 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white font-semibold rounded-lg text-xs transition"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD HEADER (shared between all trading tabs) ─── */
export function DashboardHeader({ user, activeTab, onTabChange, onLogout }) {
  const tabs = ["Markets", "Portfolio", "Leaderboard", "Library"];
  return (
    <header className="border-b border-[#21262d] bg-[#090d13] px-6 py-4 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-8">
        <div className="text-white font-black text-lg flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded rotate-45" />
          QuantumTrader
        </div>
        <nav className="hidden md:flex gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t.toLowerCase())}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                activeTab === t.toLowerCase()
                  ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                  : "text-[#8b949e] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs font-bold text-white">@{user?.username || "Trader"}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            Cash: ${(user?.balance ?? 10000).toLocaleString()}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 bg-[#161b22] hover:bg-rose-950/20 border border-[#30363d] hover:border-rose-900/30 text-[#8b949e] hover:text-rose-400 rounded-lg transition"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}