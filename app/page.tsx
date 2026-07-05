import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  MapPin,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Defendant Management",
      description: "Manage defendants, court dates, activity history, and notes.",
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      title: "Bond Management",
      description: "Track premium payments, collateral, status workflows, and court dates.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      title: "SMS Communication Center",
      description: "Two-way text message log, reminders, and notifications.",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-amber-500" />,
      title: "Payment System",
      description: "Process card/ACH payments, auto-pay schedules, and plans via Stripe.",
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-rose-500" />,
      title: "Electronic Signatures",
      description: "Build document templates, sign online, and keep full audit trails.",
    },
    {
      icon: <MapPin className="h-6 w-6 text-cyan-500" />,
      title: "Mobile Check-In",
      description: "Secure selfie check-in with GPS and device info tracking.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              BondMaster
            </span>
          </div>

          <div className="flex items-center gap-4">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background" />

        <div className="container mx-auto text-center max-w-4xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-all cursor-pointer">
            <span>Next.js 16 (App Router) & Tailwind v4 Live</span>
            <ArrowRight className="h-3 w-3" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-transparent">
            Bail Bond Management
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              Reimagined & Automated
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            The all-in-one platform for modern bond agencies. Track defendants, manage premium payment schedules, send automated reminders, and run mobile GPS check-ins.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              href="/dashboard"
              className="h-11 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="h-11 px-6 rounded-lg border bg-muted/30 font-medium hover:bg-muted/50 transition-colors">
              Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 border-t bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Powerful Core Features
            </h2>
            <p className="text-muted-foreground">
              Everything your agency needs to streamline workflows, reduce defaults, and maximize premium collections.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border bg-background p-6 hover:shadow-md hover:border-foreground/20 transition-all duration-300"
              >
                <div className="mb-4 rounded-lg bg-muted/60 p-3 w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          &copy; 2026 BondMaster. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
