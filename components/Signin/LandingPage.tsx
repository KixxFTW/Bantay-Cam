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
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CameraIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const PhoneIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const MapPinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const BackIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
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
    const DOT_COUNT = 100;
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
    "w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border border-blue-900/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50";

  const features = [
    {
      icon: (
        <img
          src={aiThreatImg}
          alt="AI Threat Detection"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "AI Threat Detection",
      desc: "Advanced AI analyzes video in real time to identify threats.",
      color: "#3b82f6",
    },
    {
      icon: (
        <img
          src={smsAlertsImg}
          alt="Instant SMS Alerts"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "Instant SMS Alerts",
      desc: "Get immediate SMS notifications when a threat is detected.",
      color: "#6366f1",
    },
    {
      icon: (
        <img
          src={liveMonImg}
          alt="Live Monitoring"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "Live Monitoring",
      desc: "Watch live feeds from your camera anytime, anywhere.",
      color: "#0ea5e9",
    },
    {
      icon: (
        <img
          src={hdImg}
          alt="High Definition"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "High Definition",
      desc: "Supports up to 2K/1080P HD video with clear audio.",
      color: "#8b5cf6",
    },
    {
      icon: (
        <img
          src={secureImg}
          alt="Secure Storage"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "Secure Storage",
      desc: "Recorded videos are stored securely and can be accessed anytime.",
      color: "#10b981",
    },
    {
      icon: (
        <img
          src={easyImg}
          alt="Easy to Use"
          style={{ width: 45, height: 45, objectFit: "contain" }}
        />
      ),
      title: "Easy to Use",
      desc: "User-friendly web platform that is easy to setup and manage.",
      color: "#f59e0b",
    },
  ];

  const howSteps = [
    {
      num: 1,
      label: "Capture",
      desc: "The CCTV camera captures live video and audio.",
      img: captureImg,
      isDetect: false,
    },
    {
      num: 2,
      label: "Transmit",
      desc: "The video feed is sent securely to our cloud system.",
      img: transmitImg,
      isDetect: false,
    },
    {
      num: 3,
      label: "Analyze",
      desc: "AI models analyze frames in real time for potential threats.",
      img: analyzeImg,
      isDetect: false,
    },
    {
      num: 4,
      label: "Detect",
      desc: "When a threat is detected, the system triggers an alert.",
      img: detectImg,
      isDetect: true,
    },
    {
      num: 5,
      label: "Notify",
      desc: "Instant SMS alert is sent to the user immediately.",
      img: notifyImg,
      isDetect: false,
    },
  ];

  const targets = [
    {
      label: "Homeowners",
      desc: "Protect your home and loved ones, even when you're away.",
      img: homeownersImg,
    },
    {
      label: "Working Professionals",
      desc: "Stay updated and worry-free while you focus on your work.",
      img: workingImg,
    },
    {
      label: "Small Business Owners",
      desc: "Monitor your business in real time and prevent fire risk.",
      img: smallbusinessImg,
    },
    {
      label: "Frequent Travelers",
      desc: "Get peace of mind wherever you are in the world.",
      img: travelerImg,
    },
  ];

  const threats = [
    {
      label: "Burglary Detection",
      desc: "Detects suspicious intrusions and break-ins.",
      img: burglaryImg,
    },
    {
      label: "Weapon Detection",
      desc: "Identifies the presence of weapons.",
      img: weaponImg,
    },
    {
      label: "Fire Detection",
      desc: "Detects fire and smoke for early warning.",
      img: fireImg,
    },
  ];

  const whyChoose = [
    {
      icon: (
        <img
          src={aiDetectionImg}
          alt="AI Detection"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "cover" as const,
          }}
        />
      ),
      title: "AI-Powered Detection",
      desc: "Detects threats such as burglary, weapons, and fire in real time.",
    },
    {
      icon: (
        <img
          src={smsAlertImg}
          alt="SMS Alerts"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "cover" as const,
          }}
        />
      ),
      title: "Instant SMS Alerts",
      desc: "Receive immediate notifications directly on your mobile phone.",
    },
    {
      icon: (
        <img
          src={remoteImg}
          alt="Remote Monitoring"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "cover" as const,
          }}
        />
      ),
      title: "Remote Monitoring",
      desc: "Access your camera feeds anytime, anywhere through the web.",
    },
    {
      icon: (
        <img
          src={pesoImg}
          alt="Affordable"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "cover" as const,
          }}
        />
      ),
      title: "Affordable & Reliable",
      desc: "High-quality security at a cost effective price.",
    },
  ];

  const termsContent = [
    {
      title: "1. Acceptance of Terms",
      body: "By creating an account and using BantayCam, you agree to comply with and be bound by these Terms and Regulations. If you do not agree, please do not use this service.",
    },
    {
      title: "2. Use of Service",
      body: "BantayCam is intended for lawful surveillance of your own property. You must not use the system to monitor individuals without their consent or in violation of any applicable local, national, or international laws.",
    },
    {
      title: "3. Data Privacy",
      body: "We collect and store camera footage, account information, and alert logs to provide our services. Your data is kept confidential and will not be shared with third parties without your explicit consent, except when required by law.",
    },
    {
      title: "4. SMS Alert Notifications",
      body: "By registering your mobile number, you consent to receive automated SMS alerts from BantayCam when a threat is detected. Standard messaging rates may apply depending on your network provider.",
    },
    {
      title: "5. Account Responsibility",
      body: "You are solely responsible for maintaining the confidentiality of your login credentials. BantayCam is not liable for any unauthorized access resulting from your failure to protect your account information.",
    },
    {
      title: "6. System Limitations",
      body: "BantayCam uses AI-based detection which may not be 100% accurate at all times. The system should be used as a supplementary security measure and not as the sole means of protection.",
    },
    {
      title: "7. Modifications",
      body: "BantayCam reserves the right to update these Terms and Regulations at any time. Continued use of the service after changes are posted constitutes your acceptance of the new terms.",
    },
  ];

  const sectionDivider = "1px solid rgba(59,130,246,0.1)";

  return (
    <div
      className="relative min-h-screen w-full text-white flex flex-col"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      <PlexusCanvas />

      <div
        className="relative flex flex-col"
        style={{ zIndex: 1, minHeight: "100vh" }}
      >
        {/* ── NAV ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            height: 64,
            background: "rgba(3,8,30,0.92)",
            borderBottom: "1px solid rgba(59,130,246,0.15)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(37,99,235,0.2)",
                border: "1px solid rgba(59,130,246,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa",
              }}
            >
              <ShieldIcon size={18} />
            </div>
            <div>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                BANTAYCAM
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#60a5fa",
                  margin: 0,
                  letterSpacing: "0.12em",
                }}
              >
                AI-Powered Smart CCTV System for Real-Time Threat Detection with
                SMS Alerts
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={openLogin}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              LOG IN
            </button>
            <button
              onClick={openSignup}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "#2563eb",
                border: "1px solid #3b82f6",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              SIGN UP
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {panel === "hero" && (
            <>
              {/* ── HERO ── */}
              <section
                style={{
                  display: "flex",
                  minHeight: 520,
                  position: "relative",
                  overflow: "visible",
                  background: `url(${bgImg}) center/cover no-repeat`,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "60px 40px 60px 48px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#aacffd",
                      marginBottom: 16,
                      textTransform: "uppercase",
                    }}
                  >
                    AI-Powered Smart CCTV System
                  </p>
                  <h1
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      margin: "0 0 20px",
                      color: "#fff",
                    }}
                  >
                    SMART SECURITY.
                    <br />
                    <span style={{ color: "#b2ceff" }}>
                      REAL-TIME PROTECTION.
                    </span>
                  </h1>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#ffffff",
                      lineHeight: 1.7,
                      maxWidth: 440,
                      margin: "0 0 36px",
                    }}
                  >
                    BantayCam uses advanced AI technology to detect potential
                    threats in real time and instantly notifies you via SMS,
                    allowing you to act quickly anytime, anywhere.
                  </p>
                  <div style={{ display: "flex", gap: 14 }}>
                    <button
                      onClick={openSignup}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "13px 28px",
                        background: "#2563eb",
                        border: "1px solid #3b82f6",
                        borderRadius: 10,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      GET STARTED <ArrowRightIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Why Choose panel */}
                <div
                  style={{
                    width: 250,
                    height: 455,
                    flexShrink: 0,
                    background: "rgba(5,15,50,0.95)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    borderRadius: 15,
                    padding: "32px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    margin: "55px 24px 40px 0",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                      margin: "0 0 20px",
                    }}
                  >
                    Why Choose BantayCam?
                  </p>
                  {whyChoose.map((w, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, marginBottom: 20 }}
                    >
                      <div style={{ flexShrink: 0 }}>{w.icon}</div>
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                            margin: "0 0 3px",
                          }}
                        >
                          {w.title}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#848991",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {w.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── ROW 1: ABOUT + FEATURES ── */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                  borderTop: sectionDivider,
                  background: "rgba(4,8,28,0.8)",
                }}
              >
                {/* About */}
                <div
                  style={{ padding: "40px 36px", borderRight: sectionDivider }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    About BantayCam
                  </p>
                  <div
                    style={{
                      width: 55,
                      height: 3,
                      background: "#3b82f6",
                      borderRadius: 2,
                      marginBottom: 16,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 10px",
                    }}
                  >
                    <span style={{ color: "#3b82f6" }}>BantayCam</span> is an
                    AI-powered smart CCTV system designed to provide real-time
                    monitoring and threat detection for homes and small
                    businesses.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 20,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          color: "#848991",
                          lineHeight: 1.6,
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        Unlike regular CCTV that only records video, BantayCam
                        analyzes live camera feeds using artificial intelligence
                        to identify potential dangers such as burglary, weapons,
                        and fire. When a threat is detected, the system
                        instantly sends an SMS alert to keep you informed in
                        real time and can respond without delay.
                      </p>
                      <img
                        src={aboutImg}
                        alt="BantayCam System Preview"
                        style={{
                          width: 200,
                          flexShrink: 0,
                          borderRadius: 10,
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#848991",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      BantayCam gives you complete control through a web-based
                      platform, allowing you to monitor your property anytime,
                      anywhere. Stay connected to what matters most with instant
                      access to live feeds and real-time updates, all in one
                      user-friendly interface. Whether you're at home, at work,
                      or on the move, BantayCam ensures you're always one step
                      ahead, empowering you to act fast, stay informed, and
                      protect with confidence.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: "40px 36px" }}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    Features
                  </p>
                  <div
                    style={{
                      width: 55,
                      height: 3,
                      background: "#3b82f6",
                      borderRadius: 2,
                      marginBottom: 20,
                    }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ color: f.color }}>{f.icon}</div>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                          }}
                        >
                          {f.title}
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#64748b",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {f.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── ROW 2: HOW IT WORKS + DESIGNED FOR ── */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                  borderTop: sectionDivider,
                  background: "rgba(3,6,22,0.85)",
                }}
              >
                {/* How It Works */}
                <div
                  style={{ padding: "40px 36px", borderRight: sectionDivider }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    How BantayCam Works
                  </p>
                  <div
                    style={{
                      width: 55,
                      height: 3,
                      background: "#2563eb",
                      borderRadius: 2,
                      marginBottom: 20,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 20,
                      alignItems: "flex-start",
                    }}
                  >
                    {howSteps.map((s, i) => (
                      <React.Fragment key={s.num}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: 62,
                              height: 62,
                              borderRadius: "50%",
                              background: s.isDetect
                                ? "rgba(220,38,38,0.2)"
                                : "rgba(37,99,235,0.2)",
                              border: `2px solid ${s.isDetect ? "rgba(220,38,38,0.6)" : "rgba(59,130,246,0.5)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={s.img}
                              alt={s.label}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#fff",
                              margin: 0,
                              textAlign: "center",
                            }}
                          >
                            {s.num}. {s.label}
                          </p>
                          <p
                            style={{
                              fontSize: 15,
                              color: "#64748b",
                              margin: 0,
                              textAlign: "center",
                              lineHeight: 1.4,
                            }}
                          >
                            {s.desc}
                          </p>
                        </div>
                        {i < howSteps.length - 1 && (
                          <div
                            style={{
                              color: "rgba(96,165,250,0.5)",
                              paddingTop: 27,
                              flexShrink: 0,
                            }}
                          >
                            <ArrowRightIcon size={20} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div
                    style={{
                      background: "rgba(37,99,235,0.1)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      <ShieldIcon size={22} />
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#b2ceff",
                          margin: 0,
                        }}
                      >
                        Stay informed. Stay prepared. Stay protected.
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#64748b",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      BantayCam watches over what matters most to you.
                    </p>
                  </div>
                </div>

                {/* Designed For */}
                <div style={{ padding: "40px 36px" }}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    Designed for you
                  </p>
                  <div
                    style={{
                      width: 55,
                      height: 3,
                      background: "#2563eb",
                      borderRadius: 2,
                      marginBottom: 20,
                    }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    {targets.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0,
                        }}
                      >
                        <img
                          src={t.img}
                          alt={t.label}
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: "contain",
                          }}
                        />
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                            textAlign: "center",
                          }}
                        >
                          {t.label}
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#64748b",
                            margin: 0,
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          {t.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── ROW 3: DETECTS THREATS ── */}
              <section
                style={{
                  borderTop: sectionDivider,
                  background: "rgba(4,8,28,0.8)",
                }}
              >
                <div style={{ padding: "40px 36px" }}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                      textAlign: "center",
                    }}
                  >
                    Detects Real Threats
                  </p>
                  <div
                    style={{
                      width: 55,
                      height: 3,
                      background: "#2563eb",
                      borderRadius: 2,
                      margin: "4px auto 20px",
                      marginLeft: 590,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 16,
                      justifyContent: "center",
                      maxWidth: 900,
                      margin: "0 auto",
                    }}
                  >
                    {threats.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={t.img}
                            alt={t.label}
                            style={{
                              width: "auto",
                              height: 220,
                              display: "block",
                              borderRadius: 10,
                              margin: "0 auto",
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                            textAlign: "center",
                          }}
                        >
                          {t.label}
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#64748b",
                            margin: 0,
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          {t.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── FOOTER ── */}
              <footer
                style={{
                  background: "#05080f",
                  borderTop: "1px solid rgba(59,130,246,0.1)",
                  padding: "28px 48px",
                  display: "flex",
                  alignItems: "center",
                  gap: 40,
                  justifyContent: "flex-start",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      fontSize: 16,
                      fontStyle: "italic",
                      color: "#60a5fa",
                      margin: 0,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    Bright future
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      fontStyle: "italic",
                      color: "#60a5fa",
                      margin: 0,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    starts here.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#fff",
                        margin: 0,
                      }}
                    >
                      URDANETA CITY UNIVERSITY
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "#64748b",
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      COLLEGE OF ENGINEERING AND ARCHITECTURE
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#64748b",
                  }}
                >
                  <MapPinIcon size={14} />
                  <div>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                      San Vicente West,
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                      Urdaneta City, Pangasinan,
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                      Philippines
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#64748b",
                  }}
                >
                  <PhoneIcon size={14} />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    +63 993 523 8025
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#64748b",
                  }}
                >
                  <MailIcon size={14} />
                  <p style={{ fontSize: 11, color: "#60a5fa", margin: 0 }}>
                    BantayCam1@gmail.com
                  </p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                    BantayCam 2026
                  </p>
                </div>
              </footer>
            </>
          )}

          {/* ── LOGIN / SIGNUP ── */}
          {(panel === "login" || panel === "signup") && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="w-full max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setPanel("hero");
                  }}
                  className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <BackIcon /> Back
                </button>
                <div
                  className="rounded-2xl border border-blue-900/40 backdrop-blur-md p-8 shadow-2xl shadow-black/50"
                  style={{ background: "rgba(5,14,46,0.85)" }}
                >
                  <h2 className="text-xl font-bold text-white mb-1">
                    {panel === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    {panel === "login"
                      ? "Enter your credentials to open the dashboard."
                      : "Set up your email and password to get started."}
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete={
                          panel === "login"
                            ? "current-password"
                            : "new-password"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                    {panel === "signup" && (
                      <div>
                        <label
                          htmlFor="confirm"
                          className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                        >
                          Confirm password
                        </label>
                        <input
                          id="confirm"
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputCls}
                          placeholder="••••••••"
                        />
                      </div>
                    )}

                    {/* ── Terms Checkbox (signup only) ── */}
                    {panel === "signup" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          marginTop: 12,
                        }}
                      >
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          style={{
                            marginTop: 2,
                            accentColor: "#3b82f6",
                            width: 15,
                            height: 15,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                        <label
                          htmlFor="terms"
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            lineHeight: 1.5,
                          }}
                        >
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#3b82f6",
                              fontSize: 12,
                              cursor: "pointer",
                              padding: 0,
                              textDecoration: "underline",
                              fontWeight: 600,
                            }}
                          >
                            Terms and Regulations
                          </button>
                        </label>
                      </div>
                    )}

                    {error && (
                      <p
                        className="text-xs text-red-400 font-medium"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/25 transition-all"
                    >
                      {panel === "login" ? "Log in" : "Create account"}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-sm text-slate-500">
                    {panel === "login" ? (
                      <>
                        No account?{" "}
                        <button
                          type="button"
                          onClick={openSignup}
                          className="text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={openLogin}
                          className="text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          Log in
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Camera Permission Modal ── */}
      {showCameraPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#0d1b3e",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 16,
              padding: "40px 32px",
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.15)",
                border: "2px solid rgba(59,130,246,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa",
              }}
            >
              <CameraIcon size={34} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 8px",
                }}
              >
                Camera Access Required
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                BantayCam needs access to your camera to enable live monitoring
                and AI-powered threat detection. Your camera feed is processed
                securely and is never shared without your consent.
              </p>
            </div>
            <div
              style={{
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10,
                padding: "12px 16px",
                width: "100%",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#60a5fa",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                🔒 Your privacy is our priority. Camera access is only used for
                real-time monitoring within BantayCam and is never recorded
                without your knowledge.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
              }}
            >
              <button
                onClick={requestCameraPermission}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "#2563eb",
                  border: "1px solid #3b82f6",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Allow Camera Access
              </button>
              <button
                onClick={() => {
                  setShowCameraPrompt(false);
                  onAuthenticated();
                }}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Not Now (Limited Features)
              </button>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#475569",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              You can change camera permissions anytime in your browser
              settings.
            </p>
          </div>
        </div>
      )}

      {/* ── Terms Modal ── */}
      {showTerms && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowTerms(false)}
        >
          <div
            style={{
              background: "#0d1b3e",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 16,
              padding: "36px 32px",
              maxWidth: 560,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 750,
                    color: "#fff",
                    margin: "0 0 4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Terms and Regulations
                </p>
                <p style={{ fontSize: 12, color: "#8e9eb5", margin: 0 }}>
                  Last updated:{" "}
                  <span style={{ color: "#a4cdff", fontWeight: 600 }}>
                    April 28, 2026
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {termsContent.map((section, i) => (
                <div key={i}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#60a5fa",
                      margin: "0 0 4px",
                    }}
                  >
                    {section.title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setAgreedToTerms(true);
                setShowTerms(false);
              }}
              style={{
                marginTop: 24,
                width: "100%",
                padding: "12px",
                background: "#2563eb",
                border: "1px solid #3b82f6",
                borderRadius: 10,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
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
