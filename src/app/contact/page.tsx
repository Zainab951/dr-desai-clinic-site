import { Address } from "@/components/Address";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LocationActions, Timings } from "@/components/LocationBits";
import { SocialLinks } from "@/components/SocialLinks";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { EmailLink } from "@/components/EmailLink";
import { ClockIcon, MailIcon, PhoneIcon } from "@/components/Icons";
import { BRANCHES, EMAIL, FEES, MAIN, MAP, PHONE, telHref } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact & Visit Us | Clinic in Kanjurmarg East, Mumbai",
  description: "Visit Dr. Desai's Health Clinic and Diabetes Center opposite Runwal Bliss main gate, Kanjurmarg East. Timings, map, call, WhatsApp, plus Nahar Medical Center and Powai Polyclinic.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Contact & Visit Us", path: "/contact" }]} />
      <section className="bg-cream py-10" aria-labelledby="contact-h1">
        <div className="container-page">
          <h1 id="contact-h1" className="fx-reveal text-center text-title font-bold">Contact &amp; Visit Us</h1>
          <p className="mt-2 text-center text-lead text-body">Call or WhatsApp directly. Every enquiry goes straight to the clinic, no booking form or portal.</p>

          {/* MAIN CLINIC */}
          <div className="fx-reveal mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-location="main">
            <div className="rounded-[10px] border border-line bg-white p-5">
              <h2 className="mb-3 text-[18px] font-bold">{MAIN.name}</h2>
              <Address />
              <h3 className="mt-5 flex items-center gap-2 text-[17px] font-bold"><ClockIcon className="h-[18px] w-[18px] text-teal-800" />Timings</h3>
              <Timings loc={MAIN} />
              <p className="mt-2 text-[16px] leading-[1.7] text-body">Consultation fee: {FEES.first} first visit, {FEES.followUp} follow-up.</p>
              <p className="mt-4 flex items-center gap-2 text-[16px] text-body"><PhoneIcon className="h-[18px] w-[18px] text-teal-800" />Phone: <a href={telHref} className="font-bold text-teal-800 hover:underline">{PHONE.display}</a></p>
              <div className="mt-3 flex flex-wrap items-center gap-2" data-email-actions>
                <EmailLink ariaLabel={`Email us at ${EMAIL}`} className="fx-btn inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-teal-800 bg-white px-4 text-[16px] font-bold text-teal-800 hover:bg-teal-50">
                  <MailIcon className="h-4 w-4" />
                  Email us
                </EmailLink>
                <CopyEmailButton />
              </div>
              <SocialLinks tone="light" className="mt-3" />
              <LocationActions loc={MAIN} />
            </div>
            <div className="overflow-hidden rounded-[10px] border border-line bg-white">
              <div className="relative h-[250px] w-full">
                <iframe title={MAP.title} src={MAP.embedUrl(MAIN)} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
            </div>
          </div>

          {/* OTHER LOCATIONS */}
          <h2 className="mt-10 text-[20px] font-bold">Also consults at</h2>
          <ul className="fx-grid mt-4 grid gap-4 sm:grid-cols-2">
            {BRANCHES.map((b, i) => (
              <li key={b.slug} className="fx-card flex flex-col overflow-hidden rounded-[10px] border border-line bg-white" data-location={b.slug}>
                {b.mapsEmbedSrc && (
                  <div className="relative h-[250px] w-full">
                    <iframe title={`Map showing ${b.name}, ${b.place}, Mumbai`} src={b.mapsEmbedSrc} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-1 inline-block w-fit rounded-full bg-teal-950 px-2.5 py-0.5 text-[13px] font-bold text-mint">0{i + 1}</span>
                  <h3 className="text-[18px] font-bold leading-snug">{b.name}</h3>
                  <address className="mt-1 not-italic text-[16px] leading-[1.6] text-body">
                    {b.address.lines.map((l) => <span key={l} className="block">{l}</span>)}
                  </address>
                  <h4 className="mt-3 flex items-center gap-2 text-[16px] font-bold"><ClockIcon className="h-4 w-4 text-teal-800" />Timings</h4>
                  <Timings loc={b} />
                  {b.fee && <p className="mt-2 text-[16px] leading-[1.6] text-body">Fee {b.fee}{b.distance ? ` · ${b.distance}` : ""}</p>}
                  <div className="mt-auto"><LocationActions loc={b} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
