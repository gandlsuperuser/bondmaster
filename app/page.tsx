import { Suspense } from "react";
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  MapPin,
  CheckSquare,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

export default function Home() {
  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Defendant Management",
      description: "Track defendants, court dates, activity history, and notes.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Bond Management",
      description: "Premium payments, collateral, status workflows, and more.",
      color: "bg-violet-100 text-violet-600",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "SMS Center",
      description: "Two-way text messages, automated reminders & notifications.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Payment Processing",
      description: "Card/ACH payments, auto-pay schedules via Stripe.",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: <CheckSquare className="h-5 w-5" />,
      title: "E-Signatures",
      description: "Document templates, online signing, and audit trails.",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Mobile Check-In",
      description: "Selfie check-in with GPS and device info tracking.",
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  const stats = [
    { label: "Bonds Managed", value: "50K+", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "Agencies", value: "200+", icon: <Shield className="h-4 w-4" /> },
    { label: "Uptime", value: "99.9%", icon: <Zap className="h-4 w-4" /> },
    { label: "Response Time", value: "<100ms", icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              BondsMaster
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400 border-l border-slate-200 pl-2.5 ml-0.5">
              Bail Bonds
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <a href="#features" className="hidden sm:block text-slate-500 hover:text-slate-900 transition-colors font-medium">
              Features
            </a>
            <a href="#login" className="hidden sm:block text-slate-500 hover:text-slate-900 transition-colors font-medium">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Split: Left Branding / Right Login) ───── */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Left: Hero Content */}
            <div className="flex flex-col gap-8 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700 w-fit shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>The #1 Bail Bonds Management Platform</span>
              </div>

              {/* Headline */}
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1] text-slate-900">
                  Bail Bonds Management,{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
                    Reimagined & Automated
                  </span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                  The all-in-one bail bonds platform for modern agencies. Track defendants, manage premium payments, send automated court reminders, and run mobile GPS check-ins.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {stat.icon}
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span>HIPAA Ready</span>
                </div>
              </div>
            </div>

            {/* Right: Login Card */}
            <div id="login" className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                <Suspense fallback={<LoginFormFallback />}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything Your Agency Needs
            </h2>
            <p className="text-slate-500">
              Streamline workflows, reduce defaults, and maximize premium collections with our powerful suite of tools.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`mb-4 rounded-xl p-2.5 w-fit ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-base mb-1.5 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-gradient-to-br from-blue-600 to-blue-700">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-600">BondsMaster</span>
            <span>Bail Bonds</span>
          </div>
          <span>&copy; 2026 BondsMaster. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
