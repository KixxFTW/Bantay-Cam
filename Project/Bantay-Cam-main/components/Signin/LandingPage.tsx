import React, { useState, useEffect, useRef } from "react";
import bgImg from "./Assets/bgtop.png";
import aiDetectionImg from "./Assets/aiicon.png";
import smsAlertImg from "./Assets/sms.png";
import remoteImg from "./Assets/monitor.png";
import pesoImg from "./Assets/peso.png";
import aboutImg from "./Assets/about.png";
import liveMonImg from "./Assets/live.png";
import easyImg from "./Assets/easy.png";
import secureImg from "./Assets/Fstorage.png";
import hdImg from "./Assets/Fhd.png";
import smsAlertsImg from "./Assets/Fmessage.png";
import aiThreatImg from "./Assets/Fai.png";
import captureImg from "./Assets/capture.png";
import transmitImg from "./Assets/tansmit.png";
import analyzeImg from "./Assets/analyze.png";
import detectImg from "./Assets/detect.png";
import notifyImg from "./Assets/notify.png";
import homeownersImg from "./Assets/homeowners.png";
import workingImg from "./Assets/working.png";
import smallbusinessImg from "./Assets/smallbusiness.png";
import travelerImg from "./Assets/traveler.png";
import burglaryImg from "./Assets/burglary.png";
import weaponImg from "./Assets/weapon.png";
import fireImg from "./Assets/fire.png";

type NavPanel = "hero" | "login" | "signup";

export interface LandingPageProps {
  onAuthenticated: () => void;
}

const ShieldIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CameraIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PhoneIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MapPinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// ── Plexus Canvas ─────────────────────────────────────────────────────────
const PlexusCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DOT_COUNT = 50; // Reduced for mobile perf
    const MAX_DIST = 150;
    type Dot = { x: number; y: number; vx: number; vy: number; r: number };
    let dots: Dot[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const init = () => {
      dots = Array.from({ length: DOT_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.5 + 0.8,
      }));
    };
    resize();
    init();
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x,
            dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(80,150,255,${(1 - dist / MAX_DIST) * 0.4})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(80,140,255,0.08)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(130,185,255,0.85)";
        ctx.fill();
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", () => {
      resize();
      init();
    });
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        display: "block",
      }}
    />
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const LandingPage: React.FC<LandingPageProps> = ({ onAuthenticated }) => {
  const [panel, setPanel] = useState<NavPanel>("hero");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCameraPrompt, setShowCameraPrompt] = useState(false);

  // Add state for scroll position
  const [activeSection, setActiveSection] = useState("about");
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setAgreedToTerms(false);
  };
  const openLogin = () => {
    resetForm();
    setPanel("login");
  };
  const openSignup = () => {
    resetForm();
    setPanel("signup");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (panel === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (panel === "signup" && !agreedToTerms) {
      setError("You must agree to the Terms and Regulations to sign up.");
      return;
    }
    setShowCameraPrompt(true);
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setShowCameraPrompt(false);
      onAuthenticated();
    } catch (err) {
      setShowCameraPrompt(false);
      onAuthenticated();
    }
  };

  const inputCls =
    "w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-slate-950/80 border border-blue-900/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50";

  const features = [
    {
      icon: <img src={aiThreatImg} alt="AI Threat Detection" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "AI Threat Detection",
      desc: "Advanced AI analyzes video in real time to identify threats.",
    },
    {
      icon: <img src={smsAlertsImg} alt="Instant SMS Alerts" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "Instant SMS Alerts",
      desc: "Get immediate SMS notifications when a threat is detected.",
    },
    {
      icon: <img src={liveMonImg} alt="Live Monitoring" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "Live Monitoring",
      desc: "Watch live feeds from your camera anytime, anywhere.",
    },
    {
      icon: <img src={hdImg} alt="High Definition" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "High Definition",
      desc: "Supports up to 2K/1080P HD video with clear audio.",
    },
    {
      icon: <img src={secureImg} alt="Secure Storage" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "Secure Storage",
      desc: "Recorded videos are stored securely and can be accessed anytime.",
    },
    {
      icon: <img src={easyImg} alt="Easy to Use" style={{ width: 40, height: 40, objectFit: "contain" }} />,
      title: "Easy to Use",
      desc: "User-friendly web platform that is easy to setup and manage.",
    },
  ];

  const howSteps = [
    { num: 1, label: "Capture", desc: "The CCTV camera captures live video and audio.", img: captureImg, isDetect: false },
    { num: 2, label: "Transmit", desc: "The video feed is sent securely to our cloud system.", img: transmitImg, isDetect: false },
    { num: 3, label: "Analyze", desc: "AI models analyze frames in real time for potential threats.", img: analyzeImg, isDetect: false },
    { num: 4, label: "Detect", desc: "When a threat is detected, the system triggers an alert.", img: detectImg, isDetect: true },
    { num: 5, label: "Notify", desc: "Instant SMS alert is sent to the user immediately.", img: notifyImg, isDetect: false },
  ];

  const targets = [
    { label: "Homeowners", desc: "Protect your home and loved ones, even when you're away.", img: homeownersImg },
    { label: "Working Professionals", desc: "Stay updated and worry-free while you focus on your work.", img: workingImg },
    { label: "Small Business Owners", desc: "Monitor your business in real time and prevent fire risk.", img: smallbusinessImg },
    { label: "Frequent Travelers", desc: "Get peace of mind wherever you are in the world.", img: travelerImg },
  ];

  const threats = [
    { label: "Burglary Detection", desc: "Detects suspicious intrusions and break-ins.", img: burglaryImg },
    { label: "Weapon Detection", desc: "Identifies the presence of weapons.", img: weaponImg },
    { label: "Fire Detection", desc: "Detects fire and smoke for early warning.", img: fireImg },
  ];

  const whyChoose = [
    { icon: <img src={aiDetectionImg} alt="AI Detection" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />, title: "AI-Powered Detection", desc: "Detects threats such as burglary, weapons, and fire in real time." },
    { icon: <img src={smsAlertImg} alt="SMS Alerts" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />, title: "Instant SMS Alerts", desc: "Receive immediate notifications directly on your mobile phone." },
    { icon: <img src={remoteImg} alt="Remote Monitoring" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />, title: "Remote Monitoring", desc: "Access your camera feeds anytime, anywhere through the web." },
    { icon: <img src={pesoImg} alt="Affordable" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />, title: "Affordable & Reliable", desc: "High-quality security at a cost effective price." },
  ];

  const termsContent = [
    { title: "1. Acceptance of Terms", body: "By creating an account and using BantayCam, you agree to comply with and be bound by these Terms and Regulations. If you do not agree, please do not use this service." },
    { title: "2. Use of Service", body: "BantayCam is intended for lawful surveillance of your own property. You must not use the system to monitor individuals without their consent or in violation of any applicable local, national, or international laws." },
    { title: "3. Data Privacy", body: "We collect and store camera footage, account information, and alert logs to provide our services. Your data is kept confidential and will not be shared with third parties without your explicit consent, except when required by law." },
    { title: "4. SMS Alert Notifications", body: "By registering your mobile number, you consent to receive automated SMS alerts from BantayCam when a threat is detected. Standard messaging rates may apply depending on your network provider." },
    { title: "5. Account Responsibility", body: "You are solely responsible for maintaining the confidentiality of your login credentials. BantayCam is not liable for any unauthorized access resulting from your failure to protect your account information." },
    { title: "6. System Limitations", body: "BantayCam uses AI-based detection which may not be 100% accurate at all times. The system should be used as a supplementary security measure and not as the sole means of protection." },
    { title: "7. Modifications", body: "BantayCam reserves the right to update these Terms and Regulations at any time. Continued use of the service after changes are posted constitutes your acceptance of the new terms." },
  ];

  //for section navigation
  const navSections = [
    { id: "about", label: "About", offset: 0 },
    { id: "features", label: "Features", offset: 600 },
    { id: "how-it-works", label: "How It Works", offset: 800 },
    { id: "designed-for", label: "Designed For", offset: 1200 },
    { id: "threats", label: "Threats", offset: 1600 },
  ];

  const sectionDivider = "1px solid rgba(59,130,246,0.1)";

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      
      for (const section of navSections) {
        const element = sectionsRef.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white flex flex-col overflow-x-hidden" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <PlexusCanvas />

      <div className="relative flex flex-col" style={{ zIndex: 1, minHeight: "100vh" }}>
        
        {/* ── RESPONSIVE NAV ── */}
        <header className="sticky top-0 z-50 h-auto md:h-20 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20">
          <div className="px-3 sm:px-4 md:px-8 py-3 md:py-0 md:h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
            
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto flex-shrink-0">
              <div className="w-8 md:w-9 h-8 md:h-9 flex-shrink-0 flex items-center justify-center bg-cyan-500/10 rounded-lg md:rounded-xl border border-cyan-500/20">
                <svg className="w-4 md:w-5 h-4 md:h-5 text-cyan-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs md:text-base text-white leading-tight truncate">BANTAYCAM</p>
                <div className="hidden sm:flex items-center gap-2 text-[8px] md:text-[9px] text-cyan-400 font-mono uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Active Monitoring</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center ml-8">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button
                onClick={openLogin}
                className="px-3 py-2 text-xs md:text-sm font-bold rounded-lg bg-transparent border border-white/25 text-white hover:border-white/50 transition-colors"
              >
                LOG IN
              </button>
              <button
                onClick={openSignup}
                className="px-3 py-2 text-xs md:text-sm font-bold rounded-lg bg-cyan-600 border border-cyan-500 text-white hover:bg-cyan-500 transition-colors"
              >
                SIGN UP
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="lg:hidden border-t border-slate-800 bg-slate-950/50 px-3 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md whitespace-nowrap flex-shrink-0 transition-all ${
                    activeSection === section.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white bg-slate-800/30"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {panel === "hero" && (
            <>
              {/* ── HERO SECTION ── */}
              <section className="relative min-h-auto md:min-h-200 py-8 md:py-20 px-3 sm:px-6 md:px-8 flex flex-col md:flex-row items-center gap-6 md:gap-0" style={{ backgroundImage: `url(${bgImg})`, backgroundPosition: "center", backgroundSize: "cover" }}>
                
                {/* Hero Content */}
                <div className="flex-1 flex flex-col justify-center z-10">
                  <p className="text-xs md:text-sm font-bold uppercase letter-spacing text-blue-300 mb-4">AI-Powered Smart CCTV System</p>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3 md:mb-4 text-white">
                    SMART SECURITY.<br />
                    <span className="text-blue-200">REAL-TIME PROTECTION.</span>
                  </h1>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-md mb-6">
                    BantayCam uses advanced AI technology to detect potential threats in real time and instantly notifies you via SMS, allowing you to act quickly anytime, anywhere.
                  </p>
                  <button
                    onClick={openSignup}
                    className="w-fit px-5 md:px-7 py-2 md:py-3 bg-blue-600 border border-blue-500 rounded-lg text-white font-bold text-sm md:text-base hover:bg-blue-500 transition-colors flex items-center gap-2"
                  >
                    GET STARTED <ArrowRightIcon size={14} />
                  </button>
                </div>

                {/* Why Choose Panel - Hidden on mobile */}
                <div className="hidden lg:flex w-60 flex-shrink-0 flex-col gap-4 bg-slate-900/80 border border-blue-500/25 rounded-2xl p-6 mt-6 lg:mt-0">
                  <p className="text-sm font-bold text-white">Why Choose BantayCam?</p>
                  {whyChoose.map((w, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0">{w.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{w.title}</p>
                        <p className="text-[11px] text-slate-400 leading-snug">{w.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── FEATURES GRID ── */}
              <section 
                id="about"
                ref={(el) => { if (el) sectionsRef.current["about"] = el; }}
                className="min-h-200 py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-slate-950/60 border-t border-cyan-500/10"
              >
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-lg md:text-2xl font-bold text-blue-400 uppercase mb-6">About & Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* About */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3">BantayCam</h3>
                      <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                        An AI-powered smart CCTV system designed to provide real-time monitoring and threat detection for homes and small businesses.
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Unlike regular CCTV that only records video, BantayCam analyzes live camera feeds using artificial intelligence to identify potential dangers such as burglary, weapons, and fire.
                      </p>
                      <img src={aboutImg} alt="BantayCam" className="w-full rounded-lg object-cover max-h-80" />
                    </div>

                    {/* Features Grid */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Key Features</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {features.map((f, i) => (
                          <div key={i} className="bg-slate-900/40 border border-blue-500/20 rounded-lg p-3">
                            <div className="mb-2 text-blue-400">{f.icon}</div>
                            <p className="text-xs md:text-sm font-bold text-white mb-1">{f.title}</p>
                            <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── HOW IT WORKS ── */}
              <section 
                id="how-it-works"
                ref={(el) => { if (el) sectionsRef.current["how-it-works"] = el; }}
                className="py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-slate-900/40 border-t border-cyan-500/10"
              >
                <div className="max-w-5xl mx-auto">
                  <h2 className="text-lg md:text-2xl font-bold text-blue-400 uppercase mb-6 text-center">How BantayCam Works</h2>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-2">
                    {howSteps.map((s, i) => (
                      <React.Fragment key={s.num}>
                        <div className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 flex-1">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${s.isDetect ? 'bg-red-500/10 border-red-500/50' : 'bg-blue-500/10 border-blue-500/50'}`}>
                            <img src={s.img} alt={s.label} className="w-6 md:w-8 h-6 md:h-8 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-bold text-white">{s.num}. {s.label}</p>
                            <p className="text-[11px] md:text-xs text-slate-400 leading-snug">{s.desc}</p>
                          </div>
                        </div>
                        {i < howSteps.length - 1 && (
                          <div className="hidden md:flex text-blue-500/40 py-4 flex-shrink-0">
                            <ArrowRightIcon size={16} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── DESIGNED FOR ── */}
              <section 
                id="designed-for"
                ref={(el) => { if (el) sectionsRef.current["designed-for"] = el; }}
                className="py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-slate-950/60 border-t border-cyan-500/10"
              >
                <div className="max-w-5xl mx-auto">
                  <h2 className="text-lg md:text-2xl font-bold text-blue-400 uppercase mb-6 text-center">Designed for You</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {targets.map((t, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 text-center">
                        <img src={t.img} alt={t.label} className="w-16 md:w-20 h-16 md:h-20 object-contain" />
                        <p className="text-xs md:text-sm font-bold text-white">{t.label}</p>
                        <p className="text-[10px] md:text-xs text-slate-400 leading-snug">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── THREAT DETECTION ── */}
              <section 
                id="threats"
                ref={(el) => { if (el) sectionsRef.current["threats"] = el; }}
                className="py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-slate-900/40 border-t border-cyan-500/10"
              >
                <div className="max-w-5xl mx-auto">
                  <h2 className="text-lg md:text-2xl font-bold text-blue-400 uppercase mb-6 text-center">Detects Real Threats</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {threats.map((t, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 text-center">
                        <img src={t.img} alt={t.label} className="w-24 md:w-32 h-24 md:h-32 object-contain rounded-lg" />
                        <p className="text-xs md:text-sm font-bold text-white">{t.label}</p>
                        <p className="text-[10px] md:text-xs text-slate-400 leading-snug">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── FOOTER ── */}
              <footer className="bg-slate-950 border-t border-cyan-500/10 py-6 md:py-8 px-3 sm:px-6 md:px-8 text-center md:text-left">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-6">
                  <div>
                    <p className="text-sm md:text-base italic text-blue-400 font-serif">Bright future starts here.</p>
                    <p className="font-bold text-white">URDANETA CITY UNIVERSITY</p>
                      <p className="text-slate-500 text-[10px]">COLLEGE OF ENGINEERING</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-xs md:text-sm">
                    <div>
                      <p className="font-bold text-white">BantayCam</p>
                      <p className="text-slate-500 text-[10px]">©BantayCam2026</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPinIcon size={12} />
                      <span className="text-[10px]">1 San Vicente West Urdaneta City Pangasinan 2428</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <PhoneIcon size={12} />
                      <span className="text-[10px]">+63 993 523 8025</span>
                    </div>
                  </div>
                </div>
              </footer>
            </>
          )}

          {/* ── LOGIN / SIGNUP ── */}
          {(panel === "login" || panel === "signup") && (
            <div className="flex-1 flex items-center justify-center px-3 sm:px-6 py-8 md:py-12">
              <div className="w-full max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setPanel("hero");
                  }}
                  className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-blue-400"
                >
                  <BackIcon /> Back
                </button>
                <div className="rounded-2xl border border-blue-900/40 bg-slate-900/85 backdrop-blur-md p-6 md:p-8 shadow-2xl">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    {panel === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mb-6">
                    {panel === "login"
                      ? "Enter your credentials to open the dashboard."
                      : "Set up your email and password to get started."}
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                    {panel === "signup" && (
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputCls}
                          placeholder="••••••••"
                        />
                      </div>
                    )}
                    {panel === "signup" && (
                      <div className="flex items-start gap-2 mt-3">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 flex-shrink-0 w-3.5 h-3.5"
                        />
                        <label htmlFor="terms" className="text-[10px] md:text-xs text-slate-400 leading-snug">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-blue-400 hover:underline font-semibold"
                          >
                            Terms and Regulations
                          </button>
                        </label>
                      </div>
                    )}
                    {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
                    <button
                      type="submit"
                      className="w-full py-2 md:py-3 rounded-xl text-sm font-bold bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 transition-colors mt-4"
                    >
                      {panel === "login" ? "Log in" : "Create account"}
                    </button>
                  </form>
                  <p className="mt-4 text-center text-xs md:text-sm text-slate-500">
                    {panel === "login" ? (
                      <>No account? <button type="button" onClick={openSignup} className="text-blue-400 hover:text-blue-300 font-semibold">Sign up</button></>
                    ) : (
                      <>Already registered? <button type="button" onClick={openLogin} className="text-blue-400 hover:text-blue-300 font-semibold">Log in</button></>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── CAMERA PERMISSION MODAL ── */}
      {showCameraPrompt && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-900/40 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center text-blue-400">
              <CameraIcon size={28} />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-white">Camera Access Required</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                BantayCam needs access to your camera to enable live monitoring and AI-powered threat detection.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">🔒 Your privacy is protected. Camera access is only used for monitoring within BantayCam.</p>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={requestCameraPermission}
                className="w-full py-2 md:py-3 bg-blue-600 border border-blue-500 rounded-lg text-white font-bold text-sm hover:bg-blue-500"
              >
                Allow Camera Access
              </button>
              <button
                onClick={() => {
                  setShowCameraPrompt(false);
                  onAuthenticated();
                }}
                className="w-full py-2 md:py-3 bg-transparent border border-white/15 rounded-lg text-slate-300 font-semibold text-sm hover:border-white/30"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS MODAL ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-slate-900 border border-blue-900/40 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-lg md:text-xl font-bold text-white">Terms and Regulations</p>
                <p className="text-xs text-slate-500">Last updated: April 28, 2026</p>
              </div>
              <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              {termsContent.map((section, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-white mb-1">{section.title}</p>
                  <p className="text-sm text-slate-400 leading-snug">{section.body}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setAgreedToTerms(true);
                setShowTerms(false);
              }}
              className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors"
            >
              I Agree to the Terms and Regulations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
