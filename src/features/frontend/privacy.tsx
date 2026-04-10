import { useState, useEffect, useCallback } from "react";
import { Shield, ArrowRight, FileText, Lock, Share2, Clock, ShieldCheck, UserCheck, Cookie, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "./site-layout";
import { useInView, SectionBadge } from "./shared";

// -- Data --

const SECTIONS = [
    {
        id: "information-we-collect",
        title: "Information we collect",
        icon: FileText,
        body: [
            "We collect information you provide directly to us, such as when you create an account, submit a support ticket, or contact us. This includes:",
            [
                "Account information: name, email address, company name, and password.",
                "Ticket content: messages, attachments, and metadata submitted through Pulse.",
                "Usage data: log files, IP addresses, browser type, pages viewed, and actions taken within the platform.",
                "Payment information: processed securely by Stripe; we do not store raw card numbers.",
            ],
            "We also collect information automatically through cookies and similar technologies when you use our services.",
        ],
    },
    {
        id: "how-we-use-your-information",
        title: "How we use your information",
        icon: UserCheck,
        body: [
            "We use the information we collect to:",
            [
                "Provide, maintain, and improve Pulse.",
                "Process transactions and send related information, including confirmations and invoices.",
                "Send technical notices, updates, security alerts, and support messages.",
                "Respond to your comments and questions.",
                "Monitor and analyze trends, usage, and activities in connection with our services.",
                "Detect, investigate, and prevent fraudulent transactions and other illegal activities.",
                "Comply with legal obligations.",
            ],
        ],
    },
    {
        id: "data-sharing",
        title: "Data sharing",
        icon: Share2,
        body: [
            "We do not sell your personal data. We may share your information with:",
            [
                "Service providers: third parties that perform services on our behalf (e.g., cloud hosting, payment processing, email delivery). These parties are bound by confidentiality obligations.",
                "Microsoft: where you choose to connect your Microsoft 365 tenant, data flows through Microsoft's infrastructure subject to Microsoft's privacy terms.",
                "Legal requirements: if required by law, court order, or governmental authority.",
                "Business transfers: in connection with a merger, acquisition, or sale of all or a portion of our assets.",
            ],
        ],
    },
    {
        id: "data-retention",
        title: "Data retention",
        icon: Clock,
        body: [
            "We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion, we delete or anonymize your data within 90 days, except where we are required to retain it for legal or compliance purposes.",
            "Ticket data and conversation history may be retained for up to 7 years where audit log requirements apply. Extended retention is available on all plans; Enterprise plans include additional compliance-grade audit log exports.",
        ],
    },
    {
        id: "security",
        title: "Security",
        icon: Lock,
        body: [
            "We use industry-standard security measures including:",
            [
                "TLS 1.3 encryption for all data in transit.",
                "AES-256 encryption for data at rest.",
                "SOC 2 Type II certified infrastructure hosted on Microsoft Azure.",
                "Role-based access controls and audit logging.",
                "Regular third-party penetration testing.",
            ],
            "No method of transmission over the Internet is 100% secure. We strive to protect your information but cannot guarantee absolute security.",
        ],
    },
    {
        id: "your-rights",
        title: "Your rights",
        icon: ShieldCheck,
        body: [
            "Depending on your location, you may have the right to:",
            [
                "Access the personal data we hold about you.",
                "Correct inaccurate or incomplete data.",
                "Request deletion of your personal data.",
                "Object to or restrict processing of your data.",
                "Data portability  receive a copy of your data in a structured, machine-readable format.",
                "Withdraw consent at any time where processing is based on consent.",
            ],
            "To exercise these rights, contact us at privacy@pulse.cc. We will respond within 30 days.",
        ],
    },
    {
        id: "cookies",
        title: "Cookies",
        icon: Cookie,
        body: [
            "We use cookies and similar tracking technologies to operate and improve our services. You can control cookies through your browser settings. Disabling cookies may limit certain features of Pulse.",
            "We use:",
            [
                "Strictly necessary cookies: required for core platform functionality.",
                "Analytics cookies: to understand how users interact with our service (e.g., Plausible Analytics, which is GDPR-compliant and cookie-free by default).",
                "Preference cookies: to remember your settings and preferences.",
            ],
        ],
    },
    {
        id: "international-transfers",
        title: "International transfers",
        icon: Globe,
        body: [
            "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.",
            "Data residency region selection (US, EU, or APAC) is available to customers on the Enterprise plan from within the platform settings.",
        ],
    },
    {
        id: "contact",
        title: "Contact",
        icon: Mail,
        body: [
            "If you have any questions about this Privacy Policy, please contact us:",
            [
                "Email: privacy@pulse.cc",
                "Post: Pulse Intelligence Ltd., Data Protection Office, 123 Innovation Way, London, EC2A 4NE, United Kingdom",
            ],
            "For EU residents, our Data Protection Officer can be reached at dpo@pulse.cc.",
        ],
    },
];

type BodyPart = string | string[];

function SectionBody({ body }: { body: BodyPart[] }) {
    return (
        <div className="space-y-4">
            {body.map((part, i) =>
                Array.isArray(part) ? (
                    <ul key={i} className="space-y-2">
                        {part.map((item, j) => (
                            <li key={j} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                                <span
                                    className="mt-1.5 size-1.5 rounded-full shrink-0"
                                    style={{ background: "var(--color-primary)" }}
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                        {part}
                    </p>
                )
            )}
        </div>
    );
}

function PrivacySection({ section, index }: { section: typeof SECTIONS[number]; index: number }) {
    const { ref, inView } = useInView({ threshold: 0.05 });
    const Icon = section.icon;
    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            id={section.id}
            className={`group scroll-mt-24 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: `${index * 40}ms` }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
                    <Icon className="size-4" style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-lg font-bold">{section.title}</h2>
            </div>
            <SectionBody body={section.body as BodyPart[]} />
        </div>
    );
}

// -- Page --

export default function PrivacyPage() {
    const [heroVisible, setHeroVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

    useEffect(() => {
        const id = requestAnimationFrame(() => setHeroVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const onMove = useCallback((e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY }), []);
    useEffect(() => {
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [onMove]);

    // Scroll spy
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
                { rootMargin: "-20% 0px -70% 0px" },
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, []);

    return (
        <SiteLayout>
            {/* Hero */}
            <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
                <div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
                <div
                    className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
                    style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                />
                <div className="relative container mx-auto px-4 max-w-3xl">
                    <div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <SectionBadge icon={Shield} label="Your data, your rights" />
                    </div>
                    <h1
                        className={`text-4xl md:text-5xl font-black mb-4 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        Privacy{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                            Policy
                        </span>
                    </h1>
                    <div className={`flex items-center gap-4 flex-wrap transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <p className="text-muted-foreground text-sm">
                            Last updated: <span className="font-medium text-foreground">March 1, 2025</span>
                        </p>
                        <span className="text-border"></span>
                        <p className="text-muted-foreground text-sm">OnDesk.cc Ltd.</p>
                    </div>
                    <p className={`text-base text-muted-foreground mt-4 leading-relaxed max-w-2xl transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        This Privacy Policy describes how Pulse Intelligence Ltd. collects, uses, and shares information about you when you use our services.
                    </p>
                    <div className={`flex gap-3 mt-6 transition-all duration-700 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <Button size="sm" asChild className="group">
                            <a href="/contact">Questions? Contact us <ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" /></a>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="">
                            <a href="/security">Security overview</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Body: sticky sidebar + content */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-[220px_1fr] gap-12 items-start">

                    {/* Sticky TOC */}
                    <aside className="hidden lg:block sticky top-24 self-start">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contents</p>
                        <nav className="space-y-1">
                            {SECTIONS.map(({ id, title, icon: Icon }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                                    style={
                                        activeId === id
                                            ? { background: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)", fontWeight: 500 }
                                            : { color: "var(--color-muted-foreground)" }
                                    }>
                                    <Icon className="size-3.5 shrink-0" />
                                    {title}
                                </a>
                            ))}
                        </nav>
                        <div
                            className="mt-6 p-4 rounded-xl text-sm space-y-2"
                            style={{ background: "color-mix(in srgb, var(--color-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
                            <p className="font-semibold text-xs" style={{ color: "var(--color-primary)" }}>Questions about privacy?</p>
                            <p className="text-xs text-muted-foreground">Contact our Data Protection Officer.</p>
                            <a href="mailto:dpo@pulse.cc" className="text-xs font-medium hover:underline" style={{ color: "var(--color-primary)" }}>dpo@pulse.cc</a>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="space-y-14">
                        {SECTIONS.map((section, i) => (
                            <PrivacySection key={section.id} section={section} index={i} />
                        ))}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}