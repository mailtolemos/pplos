import { useState, useEffect, useCallback, useRef } from "react";

// ─── Translations ───────────────────────────────────────────
const translations = {
  en: {
    tagline: "Human Resources, Simplified.",
    subtitle: "The modern HRIS platform for growing teams",
    email: "Work email",
    password: "Password",
    login: "Sign in",
    signup: "Create account",
    forgot: "Forgot password?",
    or: "or continue with",
    google: "Google",
    microsoft: "Microsoft",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    fullName: "Full name",
    company: "Company name",
    confirmPassword: "Confirm password",
    terms: "By signing up you agree to our",
    termsLink: "Terms of Service",
    and: "and",
    privacyLink: "Privacy Policy",
    welcomeBack: "Welcome back",
    getStarted: "Get started for free",
    trustedBy: "Trusted by forward-thinking companies",
    features: {
      payroll: "Payroll",
      timeoff: "Time Off",
      onboarding: "Onboarding",
      analytics: "Analytics",
    },
  },
  pt: {
    tagline: "Recursos Humanos, Simplificados.",
    subtitle: "A plataforma HRIS moderna para equipas em crescimento",
    email: "Email profissional",
    password: "Palavra-passe",
    login: "Entrar",
    signup: "Criar conta",
    forgot: "Esqueceu a palavra-passe?",
    or: "ou continuar com",
    google: "Google",
    microsoft: "Microsoft",
    noAccount: "Não tem conta?",
    hasAccount: "Já tem conta?",
    fullName: "Nome completo",
    company: "Nome da empresa",
    confirmPassword: "Confirmar palavra-passe",
    terms: "Ao registar-se concorda com os nossos",
    termsLink: "Termos de Serviço",
    and: "e",
    privacyLink: "Política de Privacidade",
    welcomeBack: "Bem-vindo de volta",
    getStarted: "Comece gratuitamente",
    trustedBy: "Empresas inovadoras confiam em nós",
    features: {
      payroll: "Salários",
      timeoff: "Férias",
      onboarding: "Integração",
      analytics: "Análises",
    },
  },
};

// ─── Company Names Animation ────────────────────────────────
const companyNames = [
  "Acme Corp",
  "Startup.io",
  "TechNova",
  "BrightPath",
  "Cloudline",
  "Mosaic HR",
  "NexGen",
  "Pulse Labs",
  "Elevate",
  "Horizonte",
  "Vertex",
  "Lumina",
  "Atlas Group",
  "Orbit",
  "Prism",
  "Beacon",
  "Summit",
  "Forge",
  "Catalyst",
  "pplos.io",
];

// ─── Icons ──────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// ─── Animated Company Ticker ────────────────────────────────
function CompanyTicker({ dark }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayName, setDisplayName] = useState(companyNames[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % companyNames.length;
          setDisplayName(companyNames[next]);
          return next;
        });
        setIsAnimating(false);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isFinal = displayName === "pplos.io";

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: "160px",
        textAlign: "center",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? "translateY(-12px)" : "translateY(0)",
        color: isFinal
          ? "#6366f1"
          : dark
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.35)",
        fontWeight: isFinal ? 700 : 400,
        fontStyle: isFinal ? "normal" : "italic",
        letterSpacing: isFinal ? "0.5px" : "0",
      }}
    >
      {displayName}
    </span>
  );
}

// ─── Feature Pills ──────────────────────────────────────────
function FeaturePills({ t, dark }) {
  const features = Object.values(t.features);
  const icons = ["💰", "🏖️", "🚀", "📊"];
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
      {features.map((f, i) => (
        <div
          key={f}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 500,
            background: dark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.08)",
            color: dark ? "rgba(255,255,255,0.7)" : "#4f46e5",
            border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}`,
            animation: `fadeSlideUp 0.5s ease ${i * 0.1 + 0.3}s both`,
          }}
        >
          <span>{icons[i]}</span>
          {f}
        </div>
      ))}
    </div>
  );
}

// ─── Floating Particles Background ──────────────────────────
function Particles({ dark }) {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            borderRadius: "50%",
            background: dark ? "rgba(129,140,248,0.25)" : "rgba(99,102,241,0.2)",
            animation: `float ${d.duration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function PPLOSLogin() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("login"); // login | signup
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const t = translations[lang];

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // ─── Theme tokens ───────────────────────────────
  const theme = dark
    ? {
        bg: "#0a0a0f",
        cardBg: "rgba(255,255,255,0.03)",
        cardBorder: "rgba(255,255,255,0.06)",
        text: "#f0f0f5",
        textMuted: "rgba(255,255,255,0.45)",
        inputBg: "rgba(255,255,255,0.05)",
        inputBorder: "rgba(255,255,255,0.1)",
        inputFocus: "rgba(99,102,241,0.5)",
        accent: "#818cf8",
        accentHover: "#6366f1",
        btnText: "#fff",
        shadow: "0 25px 60px rgba(0,0,0,0.5)",
        glowA: "rgba(99,102,241,0.15)",
        glowB: "rgba(168,85,247,0.1)",
      }
    : {
        bg: "#f8f7f4",
        cardBg: "rgba(255,255,255,0.85)",
        cardBorder: "rgba(0,0,0,0.08)",
        text: "#1a1a2e",
        textMuted: "rgba(0,0,0,0.45)",
        inputBg: "rgba(0,0,0,0.03)",
        inputBorder: "rgba(0,0,0,0.12)",
        inputFocus: "rgba(99,102,241,0.5)",
        accent: "#4f46e5",
        accentHover: "#4338ca",
        btnText: "#fff",
        shadow: "0 25px 60px rgba(0,0,0,0.08)",
        glowA: "rgba(99,102,241,0.08)",
        glowB: "rgba(168,85,247,0.05)",
      };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.5; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.7; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .pplos-input:focus {
          border-color: ${theme.inputFocus} !important;
          box-shadow: 0 0 0 3px ${theme.inputFocus}33 !important;
        }

        .pplos-input::placeholder {
          color: ${theme.textMuted};
        }

        .pplos-btn-primary {
          position: relative;
          overflow: hidden;
        }
        .pplos-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s ease infinite;
        }

        .pplos-social-btn:hover {
          border-color: ${theme.accent} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${theme.glowA};
        }

        .pplos-link:hover {
          color: ${theme.accent} !important;
        }

        .theme-toggle:hover, .lang-toggle:hover {
          background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.text,
          position: "relative",
          overflow: "hidden",
          transition: "background 0.5s ease, color 0.4s ease",
          padding: "20px",
        }}
      >
        <Particles dark={dark} />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowA}, transparent 70%)`,
            top: "-200px",
            right: "-100px",
            animation: "pulse-ring 6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowB}, transparent 70%)`,
            bottom: "-150px",
            left: "-100px",
            animation: "pulse-ring 8s ease-in-out 2s infinite",
            pointerEvents: "none",
          }}
        />

        {/* Top-right controls */}
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            display: "flex",
            gap: "8px",
            zIndex: 100,
          }}
        >
          {/* Language toggle */}
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === "en" ? "pt" : "en")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "999px",
              border: `1px solid ${theme.cardBorder}`,
              background: theme.cardBg,
              color: theme.text,
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "'Space Mono', monospace",
              transition: "all 0.2s ease",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ fontSize: "16px" }}>{lang === "en" ? "🇬🇧" : "🇵🇹"}</span>
            {lang.toUpperCase()}
          </button>

          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={() => setDark(!dark)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              borderRadius: "999px",
              border: `1px solid ${theme.cardBorder}`,
              background: theme.cardBg,
              color: theme.text,
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: dark ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </div>
          </button>
        </div>

        {/* Main card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "460px",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Logo + Branding */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${theme.accent}, #a855f7)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'Space Mono', monospace",
                  boxShadow: `0 8px 24px ${theme.glowA}`,
                }}
              >
                P
              </div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                pplos
                <span style={{ color: theme.accent }}>.io</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "8px",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                animation: "fadeSlideUp 0.5s ease 0.1s both",
              }}
            >
              {mode === "login" ? t.welcomeBack : t.getStarted}
            </h1>

            <p
              style={{
                fontSize: "15px",
                color: theme.textMuted,
                lineHeight: 1.5,
                animation: "fadeSlideUp 0.5s ease 0.2s both",
              }}
            >
              {t.subtitle}
            </p>

            {/* Animated company ticker */}
            <div
              style={{
                marginTop: "16px",
                fontSize: "14px",
                color: theme.textMuted,
                animation: "fadeSlideUp 0.5s ease 0.25s both",
              }}
            >
              {t.trustedBy}: <CompanyTicker dark={dark} />
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ marginBottom: "32px" }}>
            <FeaturePills t={t} dark={dark} />
          </div>

          {/* Card */}
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "24px",
              padding: "36px 32px",
              backdropFilter: "blur(20px)",
              boxShadow: theme.shadow,
              animation: "fadeSlideUp 0.5s ease 0.3s both",
            }}
          >
            {/* Social login */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: t.google, icon: "G", color: "#4285F4" },
                { label: t.microsoft, icon: "M", color: "#00A4EF" },
              ].map((provider) => (
                <button
                  key={provider.label}
                  className="pplos-social-btn"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: `1px solid ${theme.inputBorder}`,
                    background: "transparent",
                    color: theme.text,
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: provider.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {provider.icon}
                  </span>
                  {provider.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: theme.inputBorder }} />
              <span style={{ fontSize: "12px", color: theme.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>
                {t.or}
              </span>
              <div style={{ flex: 1, height: "1px", background: theme.inputBorder }} />
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mode === "signup" && (
                <>
                  <input
                    className="pplos-input"
                    type="text"
                    placeholder={t.fullName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    className="pplos-input"
                    type="text"
                    placeholder={t.company}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={inputStyle}
                  />
                </>
              )}

              <input
                className="pplos-input"
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />

              <div style={{ position: "relative" }}>
                <input
                  className="pplos-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "48px" }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: theme.textMuted,
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: "-8px" }}>
                  <button
                    className="pplos-link"
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.accent,
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: 500,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {t.forgot}
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                className="pplos-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading
                    ? theme.textMuted
                    : `linear-gradient(135deg, ${theme.accent}, #a855f7)`,
                  color: theme.btnText,
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "4px",
                  boxShadow: `0 4px 16px ${theme.glowA}`,
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                ) : mode === "login" ? (
                  <>
                    {t.login}
                    <span style={{ fontSize: "18px" }}>→</span>
                  </>
                ) : (
                  <>
                    {t.signup}
                    <span style={{ fontSize: "18px" }}>→</span>
                  </>
                )}
              </button>

              {mode === "signup" && (
                <p
                  style={{
                    fontSize: "12px",
                    color: theme.textMuted,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {t.terms}{" "}
                  <span style={{ color: theme.accent, cursor: "pointer" }}>{t.termsLink}</span>{" "}
                  {t.and}{" "}
                  <span style={{ color: theme.accent, cursor: "pointer" }}>{t.privacyLink}</span>
                </p>
              )}
            </div>
          </div>

          {/* Toggle mode */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "14px",
              color: theme.textMuted,
              animation: "fadeSlideUp 0.5s ease 0.5s both",
            }}
          >
            {mode === "login" ? t.noAccount : t.hasAccount}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{
                background: "none",
                border: "none",
                color: theme.accent,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {mode === "login" ? t.signup : t.login}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
