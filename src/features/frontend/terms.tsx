import { useState, useEffect, useCallback } from "react";
import { FileText, ArrowRight, Scale, Users, CreditCard, Cpu, BookOpen, EyeOff, Server, Database, AlertTriangle, XCircle, RefreshCw, Gavel, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "./site-layout";
import { useInView, SectionBadge } from "./shared";

// -- Data --

const SECTIONS = [
    {
        id: "acceptance-of-terms",
        title: "Acceptance of terms",
        icon: Scale,
        body: [
            `By accessing or using SupportDesk 365 (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.`,
            "These Terms apply to all visitors, users, and others who access or use the Service. By using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.",
        ],
    },
    {
        id: "use-of-the-service",
        title: "Use of the service",
        icon: Cpu,
        body: [
            "You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:",
            [
                "Use the Service in any way that violates any applicable law or regulation.",
                "Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, or invasive of another's privacy.",
                "Attempt to gain unauthorized access to any portion of the Service or any systems connected to the Service.",
                "Use the Service to send unsolicited communications (spam).",
                "Reverse engineer, disassemble, or decompile any part of the Service.",
                "Resell, sublicense, or otherwise transfer your access to the Service to any third party without our prior written consent.",
            ],
        ],
    },
    {
        id: "accounts",
        title: "Accounts",
        icon: Users,
        body: [
            "You are responsible for safeguarding the password used to access the Service and for any activities or actions under your account. We encourage you to use a strong password and to enable multi-factor authentication.",
            "You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to comply with this obligation.",
        ],
    },
    {
        id: "subscription-and-billing",
        title: "Subscription and billing",
        icon: CreditCard,
        body: [
            "Certain features of the Service are available on a paid subscription basis. By subscribing, you authorize us to charge your payment method on a recurring basis.",
            "Fees are non-refundable except as required by law or as expressly provided in these Terms. We may change subscription fees at any time, but we will provide at least 30 days' notice before any increase takes effect.",
            "If your payment fails, we may suspend access to the Service until payment is received. After 14 days of non-payment, we reserve the right to terminate your account.",
        ],
    },
    {
        id: "intellectual-property",
        title: "Intellectual property",
        icon: BookOpen,
        body: [
            `The Service and its original content, features, and functionality are and will remain the exclusive property of SupportDesk 365 Ltd. and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws.`,
            `You retain ownership of all content you submit, post, or display on or through the Service ("Customer Content"). By submitting Customer Content, you grant us a worldwide, non-exclusive, royalty-free license to use, process, and display such content solely to provide the Service.`,
        ],
    },
    {
        id: "confidentiality",
        title: "Confidentiality",
        icon: EyeOff,
        body: [
            "Each party agrees to keep confidential all non-public information of the other party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.",
            "This obligation does not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was known to the receiving party before disclosure; (c) is independently developed by the receiving party without use of the confidential information.",
        ],
    },
    {
        id: "service-availability",
        title: "Service availability",
        icon: Server,
        body: [
            "We aim to provide 99.9% monthly uptime for the Service, as described in our Service Level Agreement. Scheduled maintenance windows are excluded from uptime calculations and will be communicated at least 48 hours in advance.",
            "In the event of a service outage, our status page (status.supportdesk365.com) will be updated in real time. Credits for downtime below the SLA threshold are available to customers on Professional and Enterprise plans upon request.",
        ],
    },
    {
        id: "data-processing",
        title: "Data processing",
        icon: Database,
        body: [
            `By using the Service, you authorize us to process Customer Content in accordance with our Privacy Policy and, where applicable, the Data Processing Agreement ("DPA") available to Enterprise customers.`,
            "For customers subject to the GDPR, we act as a Data Processor with respect to personal data contained in Customer Content. Our Privacy Policy describes how we handle such data.",
        ],
    },
    {
        id: "disclaimer-of-warranties",
        title: "Disclaimer of warranties",
        icon: AlertTriangle,
        body: [
            `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
            "We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.",
        ],
    },
    {
        id: "limitation-of-liability",
        title: "Limitation of liability",
        icon: Scale,
        body: [
            "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SUPPORTDESK 365 LTD. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES.",
            "OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED US DOLLARS ($100).",
        ],
    },
    {
        id: "termination",
        title: "Termination",
        icon: XCircle,
        body: [
            "We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms.",
            "Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including intellectual property provisions, warranty disclaimers, and limitations of liability.",
            "You may terminate your account at any time by contacting us. Upon termination, we will provide a 30-day window to export your data before it is deleted.",
        ],
    },
    {
        id: "changes-to-terms",
        title: "Changes to terms",
        icon: RefreshCw,
        body: [
            "We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice in the Service at least 30 days before the changes take effect.",
            "Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes.",
        ],
    },
    {
        id: "governing-law",
        title: "Governing law",
        icon: Gavel,
        body: [
            "These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.",
            "Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
        ],
    },
    {
        id: "contact",
        title: "Contact",
        icon: Mail,
        body: [
            "If you have any questions about these Terms, please contact us at legal@supportdesk365.com or at:",
            [
                "SupportDesk 365 Ltd.",
                "123 Innovation Way",
                "London, EC2A 4NE",
                "United Kingdom",
            ],
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

function TermsSection({ section, index }: { section: typeof SECTIONS[number]; index: number }) {
    const { ref, inView } = useInView({ threshold: 0.05 });
    const Icon = section.icon;
    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            id={section.id}
            className={`scroll-mt-24 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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

export default function TermsPage() {
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
                        <SectionBadge icon={FileText} label="Legal agreement" />
                    </div>
                    <h1
                        className={`text-4xl md:text-5xl font-black mb-4 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        Terms of{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                            Service
                        </span>
                    </h1>
                    <div className={`flex items-center gap-4 flex-wrap transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <p className="text-muted-foreground text-sm">
                            Last updated: <span className="font-medium text-foreground">February 1, 2025</span>
                        </p>
                        <span className="text-border"></span>
                        <p className="text-muted-foreground text-sm">SupportDesk 365 Ltd.</p>
                    </div>
                    <p className={`text-base text-muted-foreground mt-4 leading-relaxed max-w-2xl transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        Please read these Terms of Service carefully before using SupportDesk 365. These Terms constitute a legally binding agreement between you and SupportDesk 365 Ltd.
                    </p>
                    <div className={`flex gap-3 mt-6 transition-all duration-700 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <Button size="sm" asChild className="group shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                            <a href="/contact">Questions? Contact us <ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-0.5 transition-transform" /></a>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                            <a href="/privacy">Privacy Policy</a>
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
                            <p className="font-semibold text-xs" style={{ color: "var(--color-primary)" }}>Legal questions?</p>
                            <p className="text-xs text-muted-foreground">Contact our legal team directly.</p>
                            <a href="mailto:legal@supportdesk365.com" className="text-xs font-medium hover:underline" style={{ color: "var(--color-primary)" }}>legal@supportdesk365.com</a>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="space-y-14">
                        {SECTIONS.map((section, i) => (
                            <TermsSection key={section.id} section={section} index={i} />
                        ))}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}