import type { Metadata } from "next";
import { BRANCHES, getSlot, MAIN, MMC, PHONE, SITE, SOCIAL, type Location } from "@/config/site";
import { resolveImage } from "@/lib/images";

export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
  const url = `${SITE.url}${opts.path}`;
  const slot = getSlot("og-share");
  const ogSrc = resolveImage(slot.file);
  const images = ogSrc ? [{ url: ogSrc, width: slot.width, height: slot.height, alt: slot.alt }] : undefined;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.clinicName,
      locale: "en_IN",
      type: "website",
      ...(images ? { images } : {}),
    },
    ...(images ? { twitter: { card: "summary_large_image" as const, title: opts.title, description: opts.description, images: images.map((i) => i.url) } } : {}),
  };
}

const clinicId = `${SITE.url}/#clinic`;
const doctorId = `${SITE.url}/#physician`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function postalAddress(loc: Location) {
  const a = loc.address;
  return {
    "@type": "PostalAddress",
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.region,
    postalCode: a.postalCode,
    addressCountry: a.country,
  };
}

function hoursSpec(loc: Location) {
  const { slots } = loc.weekly;
  const spec = (t: { opens: string; closes: string }) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: DAYS,
    opens: t.opens,
    closes: t.closes,
  });
  return slots.map(spec);
}

export function clinicSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "@id": clinicId,
    name: SITE.clinicName,
    url: SITE.url,
    telephone: PHONE.tel,
    medicalSpecialty: ["https://schema.org/Endocrine", "https://schema.org/PrimaryCare"],
    address: postalAddress(MAIN),
    ...(MAIN.mapsUrl ? { hasMap: MAIN.mapsUrl } : {}),
    geo: { "@type": "GeoCoordinates", latitude: MAIN.lat, longitude: MAIN.lng },
    areaServed: ["Kanjurmarg", "Kanjurmarg East", "Mumbai"],
    openingHoursSpecification: hoursSpec(MAIN),
    employee: { "@id": doctorId },
    sameAs: SOCIAL.map((s) => s.href),
  };
}

function workLocation(loc: Location) {
  return {
    "@type": "Place",
    name: loc.name,
    address: postalAddress(loc),
    openingHoursSpecification: hoursSpec(loc),
    // Sunday by appointment is a text note, never openingHours.
    ...(loc.sunday.status === "appointment" ? { description: `Sunday: ${loc.sunday.text}.` } : {}),
  };
}

export function physicianSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": doctorId,
    name: SITE.doctorName,
    jobTitle: SITE.doctorTitle,
    url: `${SITE.url}/about`,
    telephone: PHONE.tel,
    identifier: {
      "@type": "PropertyValue",
      name: "Maharashtra Medical Council registration number",
      value: MMC.number,
    },
    medicalSpecialty: ["https://schema.org/Endocrine", "https://schema.org/PrimaryCare"],
    worksFor: { "@id": clinicId },
    workLocation: BRANCHES.map(workLocation),
    knowsAbout: ["Diabetes", "Gestational diabetes", "Hypertension", "Thyroid disorders", "General medicine"],
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path}`,
    })),
  };
}
