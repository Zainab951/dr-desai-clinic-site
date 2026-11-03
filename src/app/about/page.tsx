import { ImageSlot } from "@/components/ImageSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CallButton } from "@/components/Buttons";
import { BuildingIcon, CalendarIcon, CapIcon, ClockIcon, ScrollIcon } from "@/components/Icons";
import { ABOUT_ME, EXPERIENCE, MMC, SITE } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Dr. Samruddha Desai | Diabetologist & Physician Mumbai",
  description: "Meet Dr. Samruddha Desai, Consultant Physician & Diabetologist (MBBS, FCPS Medicine, CCGDM) practising general medicine and diabetes care in Kanjurmarg East, Mumbai.",
  path: "/about",
});

export default function AboutPage() {
  const cards = [
    { Icon: CapIcon, k: "Qualifications", v: <>MBBS, FCPS Medicine, CCGDM</> },
    { Icon: BuildingIcon, k: "Registration", v: <>{MMC.council}, Reg. No. {MMC.number}</> },
    { Icon: ClockIcon, k: "Experience", v: <>{EXPERIENCE.years} {EXPERIENCE.text.replace(" and ", " & ")}</> },
    { Icon: CalendarIcon, k: "Clinic established", v: <>2026</> },
    { Icon: ScrollIcon, k: "Currently pursuing", v: <>Certification Course in Diabetes, Royal College of Physicians (UK)</> },
  ];
  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <section className="on-dark relative overflow-hidden bg-teal-950 py-10 text-center text-white" aria-labelledby="about-h1">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,#0f5a50_0%,transparent_70%)]" />
        <div className="container-page relative">
          <p className="text-[15px] font-bold uppercase tracking-wide text-mint">About</p>
          <h1 id="about-h1" className="mt-1 text-title font-bold">{SITE.doctorName}</h1>
          <p className="mt-1 text-lead font-bold text-teal-50/90">{SITE.doctorTitle} · Kanjurmarg (East), Mumbai</p>
        </div>
      </section>

      <section className="bg-cream py-10">
        <div className="container-page">
          <div className="fx-reveal grid gap-6 md:grid-cols-[180px_1fr] md:gap-10 lg:grid-cols-[240px_1fr]">
            <div className="mx-auto w-[180px] self-start lg:w-[240px]">
              <ImageSlot slot="about-doctor" rounded="rounded-[10px]" className="border-[4px] border-teal-800" priority />
            </div>
            <div>
              <h2 className="text-title font-bold">{SITE.doctorName}</h2>
              <p className="mt-2 text-lead font-bold text-teal-800">MBBS | FCPS Medicine (Rajawadi Hospital, Mumbai) | CCGDM (PHFI Chennai)</p>
              <p className="mt-1 text-lead font-bold text-body">Consultant Physician &amp; Diabetologist</p>
              <hr className="my-5 border-line" />
              <p className="text-lead text-body">
                Consultant Physician and Diabetologist, MBBS, FCPS Medicine (Rajawadi Hospital, Mumbai), CCGDM (PHFI Chennai). {EXPERIENCE.years} years in internal medicine, with a focus on diabetes management. Registered with the Maharashtra Medical Council (MMC), Reg. No. {MMC.number}.
              </p>
              <p className="mt-3 text-lead text-body">
                Consults at {SITE.clinicName}, focused on clear explanations and treatment plans built around each patient&apos;s daily routine.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {["Diabetes", "General Medicine"].map((t) => (
                  <li key={t} className="rounded-md border border-line bg-white px-3 py-1.5 text-[16px] font-bold text-teal-800">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="fx-reveal mt-10" data-about-me>
            <h2 className="text-h2 font-bold">About Me</h2>
            {ABOUT_ME.map((p) => (
              <p key={p} className="mt-3 text-lead text-body">{p}</p>
            ))}
          </div>

          <ul className="fx-grid mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5" data-about-cards>
            {cards.map(({ Icon, k, v }) => (
              <li key={k} className="fx-card rounded-[10px] sm:last:col-span-2 lg:last:col-span-1 border border-line bg-white p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-800 text-white"><Icon className="h-4 w-4" /></span>
                <h3 className="mt-2 text-[17px] font-bold leading-snug">{k}</h3>
                <p className="mt-1 text-copy text-body">{v}</p>
              </li>
            ))}
          </ul>

          <div className="fx-reveal mt-6 rounded-[10px] border border-line bg-note p-5">
            <h2 className="text-[20px] font-bold">Our approach</h2>
            <p className="mt-2 text-copy text-body">
              Every visit starts with a careful history and relevant tests, not a rushed prescription. Diagnosis and treatment choices are explained in plain language, and chronic conditions like diabetes are managed with a plan that fits daily routine, diet and work, reviewed and adjusted at each follow-up.
            </p>
          </div>
          <div className="fx-reveal mt-6 flex justify-center"><CallButton /></div>
        </div>
      </section>
    </>
  );
}
