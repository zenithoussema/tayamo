import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { getContactSettings } from "@/lib/contact-settings";
import { ContactForm } from "./ContactForm";
import { FadeIn } from "@/components/ui/FadeIn";
import { Phone, MessageCircle, Clock } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  const [activities, contact] = await Promise.all([
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    getContactSettings(),
  ]);

  const whatsappNumber = contact.whatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contactez<span className="gold-text">-nous</span>
            </h1>
            <p className="mx-auto max-w-lg text-text-muted">{dict.contact.subtitle}</p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form — takes 3 cols */}
          <div className="lg:col-span-3">
            <FadeIn delay={100}>
              <ContactForm
                dict={dict.contact}
                locale={locale}
                isAr={isAr}
                activities={activities}
                whatsappUrl={whatsappUrl}
              />
            </FadeIn>
          </div>

          {/* Sidebar — takes 2 cols */}
          <aside className="flex flex-col gap-5 lg:col-span-2">
            {/* Quick actions */}
            <FadeIn delay={200}>
              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${contact.phone}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-dim text-accent transition-all duration-300 group-hover:bg-accent-dim">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-text">{dict.contact.call_us}</span>
                    <span className="text-xs text-text-muted">{contact.phone}</span>
                  </div>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-emerald-500/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all duration-300 group-hover:bg-emerald-500/20">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-text">{dict.contact.whatsapp}</span>
                    <span className="text-xs text-text-muted">{isAr ? "رد سريع" : "Réponse rapide"}</span>
                  </div>
                </a>
                {contact.facebook && (
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-blue-500/20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:bg-blue-500/20">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-text">{dict.contact.facebook}</span>
                  </a>
                )}
                {contact.instagram && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-pink-500/20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 transition-all duration-300 group-hover:bg-pink-500/20">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-text">Instagram</span>
                  </a>
                )}
              </div>
            </FadeIn>

            {/* Opening hours */}
            <FadeIn delay={300}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-accent">
                  <Clock className="h-4 w-4" />
                  {dict.contact.hours_title}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-text-muted">{isAr ? "الإثنين - الجمعة" : "Lun - Ven"}</span>
                    <span className="font-medium text-text">{contact.openingHour} - {contact.closingHour}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">{isAr ? "السبت" : "Sam"}</span>
                    <span className="font-medium text-text">{contact.openingHour} - {contact.closingHour}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">{isAr ? "الأحد" : "Dim"}</span>
                    <span className="font-medium text-red-400">{isAr ? "مغلق" : "Fermé"}</span>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Map */}
            {contact.mapEmbedUrl && (
              <FadeIn delay={400}>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <iframe
                    src={contact.mapEmbedUrl}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Tayamo Sport location"
                  />
                </div>
              </FadeIn>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
