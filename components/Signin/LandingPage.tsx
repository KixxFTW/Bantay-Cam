import React, { useState } from 'react';

type Panel = 'hero' | 'login' | 'signup';

export interface LandingPageProps {
  onAuthenticated: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthenticated }) => {
  const [panel, setPanel] = useState<Panel>('hero');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const openLogin = () => {
    resetForm();
    setPanel('login');
  };

  const openSignup = () => {
    resetForm();
    setPanel('signup');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (panel === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onAuthenticated();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.15),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.06),transparent_50%)]"
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg text-white tracking-tight">Bantay Cam</p>
            <p className="text-[10px] font-mono text-cyan-400/90 uppercase tracking-[0.2em]">
              Secure access
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {panel === 'hero' && (
          <div className="w-full max-w-lg text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Monitor with confidence
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10">
              Sign in to your workspace or create an account to start using the live monitoring
              dashboard, AI-assisted analysis, and security logs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={openLogin}
                className="px-8 py-3 rounded-xl text-sm font-bold border border-slate-600 text-slate-200 hover:bg-slate-800/60 hover:border-slate-500 transition-all"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={openSignup}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-cyan-600 text-white border border-cyan-500 hover:bg-cyan-500 shadow-lg shadow-cyan-900/30 transition-all"
              >
                Sign up
              </button>
            </div>
            <p className="mt-8 text-[11px] text-slate-600 font-mono">
              By continuing you agree to use this app responsibly and in line with local privacy laws.
            </p>
          </div>
        )}

        {(panel === 'login' || panel === 'signup') && (
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setPanel('hero');
              }}
              className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-8 shadow-2xl shadow-black/40">
              <h2 className="text-xl font-bold text-white mb-1">
                {panel === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {panel === 'login'
                  ? 'Enter your credentials to open the dashboard.'
                  : 'Set up your email and password to get started.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="landing-email" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email
                  </label>
                  <input
                    id="landing-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="landing-password" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Password
                  </label>
                  <input
                    id="landing-password"
                    type="password"
                    autoComplete={panel === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50"
                    placeholder="••••••••"
                  />
                </div>
                {panel === 'signup' && (
                  <div>
                    <label
                      htmlFor="landing-confirm"
                      className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                      Confirm password
                    </label>
                    <input
                      id="landing-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-400 font-medium" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold bg-cyan-600 text-white border border-cyan-500 hover:bg-cyan-500 shadow-lg shadow-cyan-900/25 transition-all"
                >
                  {panel === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {panel === 'login' ? (
                  <>
                    No account?{' '}
                    <button
                      type="button"
                      onClick={openSignup}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={openLogin}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
