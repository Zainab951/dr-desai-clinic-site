/**
 * Single source of truth for every fact shown on the site.
 * Anything marked PLACEHOLDER is intentionally unknown: it renders as a dashed
 * placeholder in the UI and is NEVER emitted into JSON-LD / llms.txt.
 */

import { RESOURCES, resourcesVisible, type Resources } from "./resources";

export const SITE = {
  // Single source for the site host (canonical, og:url, metadataBase, sitemap, robots, JSON-LD, llms.txt).
  // Primary host is www; the apex 308-redirects to it. Deliberately a constant: no env override. No trailing slash.
  url: "https://www.drdesaihealthclinic.com",
  clinicName: "Dr. Desai's Health Clinic and Diabetes Center",
  doctorName: "Dr. Samruddha Desai",
  doctorTitle: "Consultant Physician & Diabetologist",
  qualifications: "MBBS, FCPS Medicine, CCGDM",
  locale: "en-IN",
} as const;

/** Maharashtra Medical Council registration. Defined once; shown in header, Home, About; in Physician JSON-LD. */
export const MMC = {
  council: "Maharashtra Medical Council",
  number: "2016040659",
} as const;

/** "About Me" copy on /about, word for word as written by the doctor. Single source: do not copy into components. */
export const ABOUT_ME: readonly string[] = [
  "After completing my training, I worked as a Consultant Physician in Karad, my native place, for a year, with the aim of serving the local community. I later worked at Synergy Multispeciality Hospital, Miraj, gaining valuable clinical experience in rural Maharashtra. After around four years of practice in Maharashtra, I decided to return to Mumbai, my birthplace, and establish my own clinic.",
  "I started Dr. Desai's Health Clinic and Diabetes Center in Kanjurmarg with the vision of making quality general medical care and specialised diabetes management more accessible to the local community. Recognising the need for accessible healthcare and dedicated diabetology services in the area, I wanted to create a clinic where patients could receive personalised, affordable and comprehensive medical care close to home.",
  "While my clinic was under development, I worked at Powai Polyclinic & Hospital and Nahar Medical Centre, Chandivali. This experience helped me understand the healthcare needs of Mumbai's densely populated communities, the challenges patients face in accessing medical care, and the importance of accessible, reliable physician services.",
];

/**
 * The ONE phone number. Enforced by scripts/check-phone.mjs + tests/phone.test.ts.
 * NOTE: +91 88305 31546 belongs to the Kanjurmarg clinic ONLY. The doctor has a no-promotion clause with
 * Nahar, so call / WhatsApp booking actions must never appear on the Nahar or Powai location cards
 * (see `bookable` on LOCATIONS). Header, footer and hero keep their general Call / WhatsApp buttons.
 */
export const PHONE = {
  display: "+91 88305 31546",
  tel: "+918830531546",
  whatsapp: "918830531546",
} as const;

/** Years of experience, defined once (doctor: "6 years of experience"). Used on Home and About. */
export const EXPERIENCE = { years: "6", text: "years in internal medicine and diabetology" } as const;

export const FEES = { first: "₹500", followUp: "₹300" } as const;

/** Clinic email (confirmed). Shown as a mailto: link in header, footer and Contact. */
export const EMAIL = "samruddh24@gmail.com";
export const EMAIL_SUBJECT = "Appointment enquiry";
/** Single place that builds the mailto: link (header, footer, Contact). No contact form by design. */
export function mailtoLink(subject: string = EMAIL_SUBJECT) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}
export const mailtoHref = mailtoLink();
/** Gmail web compose link for desktop browsers. Address and subject come from the constants above. */
export function gmailComposeLink(subject: string = EMAIL_SUBJECT) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(subject)}`;
}

export type Slot = { opens: string; closes: string };

export type Location = {
  slug: "main" | "nahar" | "powai";
  name: string;
  /** Call + WhatsApp booking actions allowed on this location's card? Kanjurmarg clinic only (see PHONE note). */
  bookable: boolean;
  /** Google Maps short link (kept for schema `hasMap` and an optional "Open in Maps" label on the map). Not used for Get Directions. */
  mapsUrl?: string;
  /** Optional Google Maps embed src for the iframe. Falls back to an address query embed when unset. */
  mapsEmbedSrc?: string;
  /** Coordinates: Get Directions destination; the main clinic's also feed GeoCoordinates in the clinic JSON-LD. */
  lat: number;
  lng: number;
  /** Short place label for copy, e.g. "Powai". */
  place: string;
  address: {
    /** Key landmark ("Opp. ..."); used in copy and schema. Address lines render at one uniform body size. */
    landmark?: string;
    /** Display lines, top to bottom. */
    lines: readonly string[];
    street: string;
    locality: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    /** Single-line form; also the Google Maps search text. */
    oneLine: string;
  };
  weekly: {
    days: string;
    /** Short form for compact UI, e.g. "Mon to Sat". */
    daysShort: string;
    /** Human text, e.g. "9:30 am to 11:30 am and 8:00 pm to 10:00 pm". */
    text: string;
    /** Machine hours for Mon-Sat (JSON-LD openingHoursSpecification). */
    slots: readonly Slot[];
  };
  /** Only an appointment note is ever shown or exported; "none" shows nothing (never "closed"). */
  sunday: { status: "appointment"; text: string } | { status: "none" };
  /** Fee and distance, confirmed by the doctor. */
  fee?: string;
  distance?: string;
};

export const LOCATIONS: Record<Location["slug"], Location> = {
  main: {
    slug: "main",
    bookable: true,
    mapsUrl: "https://maps.app.goo.gl/v1pZJ3r3GSakVRnK7",
    mapsEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.428904363579!2d72.93374377381808!3d19.13269395019299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c7fdf2cfe2bf%3A0x6d477fa8c6725d3c!2sDr.%20Desai's%20Health%20Clinic%20and%20Diabetes%20Center!5e0!3m2!1sen!2sin!4v1792748673177!5m2!1sen!2sin",
    lat: 19.1326889,
    lng: 72.9363187,
    name: "Dr. Desai's Health Clinic and Diabetes Center",
    place: "Kanjurmarg",
    address: {
      landmark: "Opp. Runwal Bliss main gate",
      lines: ["Opp. Runwal Bliss main gate", "1/5, Jerry Villa, Gomes Colony", "Kanjurmarg (East), Mumbai – 400042"],
      street: "1/5, Jerry Villa, Gomes Colony, Opp. Runwal Bliss main gate, Kanjurmarg (East)",
      locality: "Kanjurmarg East",
      city: "Mumbai",
      region: "Maharashtra",
      postalCode: "400042",
      country: "IN",
      oneLine: "1/5, Jerry Villa, Gomes Colony, Opp. Runwal Bliss main gate, Kanjurmarg (East), Mumbai 400042",
    },
    weekly: {
      days: "Monday to Saturday",
      daysShort: "Mon to Sat",
      text: "9:30 am to 11:30 am and 8:00 pm to 10:00 pm",
      slots: [
        { opens: "09:30", closes: "11:30" },
        { opens: "20:00", closes: "22:00" },
      ],
    },
    sunday: { status: "none" },
  },
  nahar: {
    slug: "nahar",
    bookable: false,
    lat: 19.1114738,
    lng: 72.8977022,
    mapsUrl: "https://maps.app.goo.gl/tCnRBKqAxvN4c4pH6",
    mapsEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9128490909325!2d72.89512727381752!3d19.111478850860532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c80a96876f1f%3A0x6899a75b7646d7e1!2sNahar%20Medical%20Center!5e0!3m2!1sen!2sin!4v1792748648078!5m2!1sen!2sin",
    name: "Nahar Medical Center",
    place: "Chandivali",
    address: {
      lines: ["Nahar Amrit Shakti, off Saki Vihar Road", "Chandivali, Andheri East, Mumbai 400072"],
      street: "Nahar Amrit Shakti, off Saki Vihar Road, Chandivali, Andheri East",
      locality: "Chandivali",
      city: "Mumbai",
      region: "Maharashtra",
      postalCode: "400072",
      country: "IN",
      oneLine: "Nahar Amrit Shakti, off Saki Vihar Road, Chandivali, Andheri East, Mumbai 400072",
    },
    weekly: {
      days: "Monday to Saturday",
      daysShort: "Mon to Sat",
      text: "12:00 pm to 2:00 pm and 6:00 pm to 7:30 pm",
      slots: [
        { opens: "12:00", closes: "14:00" },
        { opens: "18:00", closes: "19:30" },
      ],
    },
    sunday: { status: "appointment", text: "By appointment only, 11:00 am to 1:00 pm" },
    fee: "₹1,100",
    distance: "~6 km from clinic",
  },
  powai: {
    slug: "powai",
    bookable: false,
    lat: 19.1240698,
    lng: 72.9164363,
    mapsUrl: "https://maps.app.goo.gl/88TF7GQTvbtuoRbe8",
    mapsEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.6255798640163!2d72.91386137381785!3d19.124074850464233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c7f1f72dbeb3%3A0xf75e10c36cecb636!2sPowai%20Polyclinic%20%26%20Hospital!5e0!3m2!1sen!2sin!4v1792748621438!5m2!1sen!2sin",
    name: "Powai Polyclinic & Hospital",
    place: "Powai",
    address: {
      lines: ["19/A, Opp. I.I.T. Main Gate Rd, near South Indian Bank", "Powai, Mumbai, Maharashtra 400076"],
      street: "19/A, Opp. I.I.T. Main Gate Rd, near South Indian Bank",
      locality: "Powai",
      city: "Mumbai",
      region: "Maharashtra",
      postalCode: "400076",
      country: "IN",
      oneLine: "19/A, Opp. I.I.T. Main Gate Rd, near South Indian Bank, Powai, Mumbai, Maharashtra 400076",
    },
    weekly: {
      days: "Monday to Saturday",
      daysShort: "Mon to Sat",
      text: "3:00 pm to 4:00 pm",
      slots: [{ opens: "15:00", closes: "16:00" }],
    },
    sunday: { status: "none" },
    fee: "₹500",
    distance: "~3 km from clinic",
  },
};

/** Mon-Sat timing line for display. */
export function timingLines(loc: Location): string[] {
  const w = loc.weekly;
  return [`${w.days}: ${w.text}`];
}

export const MAIN = LOCATIONS.main;
/** Display order on Contact & Visit Us (matches the mockup: 01 Nahar, 02 Powai). */
export const BRANCHES: Location[] = [LOCATIONS.nahar, LOCATIONS.powai];
export const ALL_LOCATIONS: Location[] = [LOCATIONS.main, ...BRANCHES];

/** Get Directions: coordinate-based Google Maps directions link (one helper, no API key). */
export function directionsLink(loc: Location) {
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
}

export const MAP = {
  title: "Map showing Dr. Desai's Health Clinic and Diabetes Center, opposite Runwal Bliss, Kanjurmarg East, Mumbai",
  embedUrl: (loc: Location) => loc.mapsEmbedSrc ?? "https://www.google.com/maps?q=" + encodeURIComponent(loc.address.oneLine) + "&output=embed",
};

/** SOCIAL LINKS: exactly these two (confirmed). Both go into JSON-LD sameAs. No other platform may be added. */
export const SOCIAL = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/fat.docdiaries" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1F41VxgMqf/" },
] as const;

const BASE_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact & Visit Us" },
];

/** Header, footer, mobile menu and sitemap all read this. "Resources" follows "Contact & Visit Us" only when it has content (or showWhenEmpty). */
export function buildNav(resources: Resources): { href: string; label: string }[] {
  return resourcesVisible(resources) ? [...BASE_NAV, { href: "/resources", label: "Resources" }] : [...BASE_NAV];
}

export const NAV = buildNav(RESOURCES);

export const telHref = `tel:${PHONE.tel}`;

export function waHref(message: string) {
  return `https://wa.me/${PHONE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const WA_GENERAL = waHref(`Hello ${SITE.doctorName}, I would like to book an appointment.`);

/** Prefilled WhatsApp booking message naming THAT location. */
export function waLocationHref(loc: Location) {
  return waHref(`Hi, I would like to book an appointment at ${loc.name}.`);
}

/**
 * IMAGE SLOTS: single registry. Every slot has a fixed size/ratio, so adding the file never shifts layout.
 * Drop the file at public/images/<file> (exact name; .jpg/.jpeg/.png/.webp variants of the same name also work).
 * Missing file => dashed placeholder, build never fails. No code change needed.
 * `position` is the crop point inside the fixed box (object-position); tune per image.
 */
export type ImageSlotDef = {
  id: string;
  page: string;
  name: string;
  /** Short caption inside the dashed placeholder. */
  label: string;
  /** Path under public/images/. */
  file: string;
  /** Recommended upload size in pixels. Ratio is always width / height. */
  width: number;
  height: number;
  position: string;
  /** Optional slight zoom (>1) to push baked-in white edges of the source out of the frame. Origin = position. */
  zoom?: number;
  alt: string;
  /** next/image `sizes` = 2x the REAL rendered CSS width at each breakpoint (measured, see scripts/image-audit.mjs). */
  sizes: string;
  /** next/image quality. Must be listed in images.qualities (next.config.ts). */
  quality: 85 | 90;
};

// Rendered-width formulas (container-page: max 1360px / 1600px from 1700px, side padding 20px <640, 32px 640-1023, 48px from 1024):
const SIZES_CARD = "(min-width: 1700px) 728px, (min-width: 1360px) 608px, (min-width: 1024px) calc((100vw - 144px) / 2), (min-width: 640px) calc(100vw - 80px), calc(2 * (100vw - 40px))";
/** Home featured services render 3 per row from 1024px (not 4): 2x of (container - 2 gaps) / 3. */
export const SIZES_CARD_3 = "(min-width: 1700px) 982px, (min-width: 1360px) 822px, (min-width: 1024px) calc(2 * (100vw - 128px) / 3), (min-width: 640px) calc(100vw - 80px), calc(2 * (100vw - 40px))";
/** Cards with zoom <= 1.1 (baked-in white edges): 2.2x so the zoomed image still gets >= 2x its on-screen width. */
const SIZES_CARD_ZOOM = "(min-width: 1700px) 801px, (min-width: 1360px) 669px, (min-width: 1024px) calc(1.1 * (100vw - 144px) / 2), (min-width: 640px) calc(1.1 * (100vw - 80px)), calc(2.2 * (100vw - 40px))";
const SIZES_BANNER = "(min-width: 1700px) 3008px, (min-width: 1360px) 2528px, (min-width: 1024px) calc(2 * (100vw - 96px)), (min-width: 640px) calc(2 * (100vw - 64px)), calc(2 * (100vw - 40px))";
const SIZES_HERO = "(min-width: 1280px) 744px, (min-width: 1024px) 624px, (min-width: 768px) 424px, 404px"; // 372 / 312 / 212 / 202px inside the 4px frame
const SIZES_ABOUT = "(min-width: 1024px) 464px, 344px"; // 240px (lg) / 180px box, minus the 4px frame
const SIZES_LOGO = "100px"; // fixed 52px box, 50px inside the 1px border

export const IMAGE_SLOTS: ImageSlotDef[] = [
  { id: "home-hero", page: "Home", name: "Hero doctor photo", label: "Doctor photo", file: "doctor/hero-doctor.jpg", width: 540, height: 618, position: "center", alt: `Portrait of ${SITE.doctorName}, ${SITE.doctorTitle}`, sizes: SIZES_HERO, quality: 90 },
  { id: "about-doctor", page: "About", name: "About doctor photo", label: "Doctor photo", file: "doctor/about-doctor.jpg", width: 396, height: 405, position: "center 0%", alt: `${SITE.doctorName} at the consulting desk`, sizes: SIZES_ABOUT, quality: 90 },
  { id: "services-banner", page: "Services", name: "Services banner", label: "Services banner photo", file: "banners/services-banner.jpg", width: 1480, height: 326, position: "center", alt: "Doctor checking a patient's blood pressure", sizes: SIZES_BANNER, quality: 85 },
  { id: "svc-diabetes", page: "Home, Services", name: "Service card: Diabetes Management & Insulin Therapy", label: "Diabetes", file: "services/diabetes-management.jpg", width: 525, height: 204, position: "center", alt: "Glucometer and insulin pen for diabetes management", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-gdm", page: "Home, Services", name: "Service card: Gestational Diabetes (GDM)", label: "Gestational", file: "services/gestational-diabetes.jpg", width: 525, height: 204, position: "center", alt: "Pregnant woman checking blood sugar for gestational diabetes", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-hypertension", page: "Home, Services", name: "Service card: Hypertension & Cardiovascular Risk", label: "Hypertension", file: "services/hypertension.jpg", width: 525, height: 204, position: "center top", alt: "Blood pressure monitor for hypertension care", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-thyroid", page: "Services", name: "Service card: Thyroid and Hormonal Disorders", label: "Thyroid", file: "services/thyroid.jpg", width: 525, height: 204, position: "center 62%", alt: "Thyroid and hormonal disorder consultation", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-nebulization", page: "Services", name: "Service card: Nebulization", label: "Nebulization", file: "services/nebulization.jpg", width: 525, height: 204, position: "center", alt: "Nebulizer mask for respiratory treatment", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-general", page: "Home, Services", name: "Service card: General Physician Consultation", label: "General", file: "services/general-physician.jpg", width: 525, height: 204, position: "center 12%", alt: "Stethoscope and notes for general physician consultation", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-iv-im", page: "Services", name: "Service card: IV / IM Injections & IV Drips", label: "IV / IM", file: "services/iv-im-injections.jpg", width: 525, height: 204, position: "center 0%", alt: "Nurse preparing an injection", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-weight", page: "Services", name: "Service card: Weight Loss Management & Injections", label: "Weight loss", file: "services/weight-loss.jpg", width: 525, height: 204, position: "center 55%", alt: "Measuring tape for weight loss management", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-infectious", page: "Services", name: "Service card: Infectious Diseases & Fever Management", label: "Infectious", file: "services/infectious-diseases-fever.jpg", width: 525, height: 204, position: "25% 50%", alt: "Doctor assessing a patient with fever or infection", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-respiratory", page: "Services", name: "Service card: Respiratory Diseases", label: "Respiratory", file: "services/respiratory-diseases.jpg", width: 525, height: 204, position: "8% 50%", alt: "Doctor listening to a patient's breathing with a stethoscope", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-preventive", page: "Services", name: "Service card: Preventive Health Check-ups", label: "Check-ups", file: "services/preventive-health-checkups.jpg", width: 525, height: 204, position: "center 22%", alt: "Preventive health check-up consultation", sizes: SIZES_CARD, quality: 85 },
  { id: "svc-fitness", page: "Services", name: "Service card: Medical Fitness Certificates & Pre-operative Evaluation", label: "Fitness", file: "services/medical-fitness-certificates.jpg", width: 525, height: 204, position: "center", zoom: 1.08, alt: "Doctor completing a medical fitness certificate", sizes: SIZES_CARD_ZOOM, quality: 85 },
  { id: "svc-ecg", page: "Services", name: "Service card: ECG", label: "ECG", file: "services/ecg.jpg", width: 525, height: 204, position: "center", zoom: 1.08, alt: "ECG machine recording a heart tracing", sizes: SIZES_CARD_ZOOM, quality: 85 },
  { id: "svc-lab", page: "Services", name: "Service card: Laboratory Services", label: "Laboratory", file: "services/laboratory-services.jpg", width: 525, height: 204, position: "center", zoom: 1.06, alt: "Blood sample tubes in a laboratory", sizes: SIZES_CARD_ZOOM, quality: 85 },
  { id: "svc-home-sample", page: "Services", name: "Service card: Home Blood Sample Collection", label: "Home sample", file: "services/home-blood-sample-collection.jpg", width: 525, height: 204, position: "center", zoom: 1.055, alt: "Technician collecting a blood sample at home", sizes: SIZES_CARD_ZOOM, quality: 85 },
  { id: "logo", page: "All (header)", name: "Logo", label: "Logo", file: "brand/logo.png", width: 156, height: 156, position: "center", alt: `${SITE.clinicName} logo`, sizes: SIZES_LOGO, quality: 85 },
  { id: "favicon", page: "All (browser tab)", name: "Favicon", label: "Favicon", file: "brand/favicon.png", width: 512, height: 512, position: "center", alt: `${SITE.clinicName} icon`, sizes: "512px", quality: 85 },
  { id: "og-share", page: "All (social share / OG)", name: "OG share image", label: "Share image", file: "og/share.jpg", width: 1200, height: 630, position: "center", alt: `${SITE.clinicName}, Kanjurmarg East, Mumbai`, sizes: "1200px", quality: 85 },
];

export type ImageSlotId = (typeof IMAGE_SLOTS)[number]["id"];

export function getSlot(id: string): ImageSlotDef {
  const slot = IMAGE_SLOTS.find((s) => s.id === id);
  if (!slot) throw new Error(`Unknown image slot: ${id}`);
  return slot;
}

/** Branch locations use live Google Maps embeds (no image slots). */
export type Service = { slug: string; name: string; /** Image slot id; absent = text-only card. */ imageSlot?: string };

export const SERVICES: Service[] = [
  { slug: "diabetes", name: "Diabetes Management & Insulin Therapy", imageSlot: "svc-diabetes" },
  { slug: "gdm", name: "Gestational Diabetes (GDM)", imageSlot: "svc-gdm" },
  { slug: "hypertension", name: "Hypertension & Cardiovascular Risk Management", imageSlot: "svc-hypertension" },
  { slug: "thyroid", name: "Thyroid and Hormonal Disorders Consultation", imageSlot: "svc-thyroid" },
  { slug: "nebulization", name: "Nebulization", imageSlot: "svc-nebulization" },
  { slug: "general", name: "General Physician Consultation", imageSlot: "svc-general" },
  { slug: "iv-im", name: "IV / IM Injections & IV Drips", imageSlot: "svc-iv-im" },
  { slug: "weight", name: "Weight Loss Management & Injections", imageSlot: "svc-weight" },
  { slug: "infectious", name: "Infectious Diseases & Fever Management", imageSlot: "svc-infectious" },
  { slug: "respiratory", name: "Respiratory Diseases", imageSlot: "svc-respiratory" },
  { slug: "preventive", name: "Preventive Health Check-ups", imageSlot: "svc-preventive" },
  { slug: "fitness", name: "Medical Fitness Certificates & Pre-operative Evaluation", imageSlot: "svc-fitness" },
  { slug: "ecg", name: "ECG", imageSlot: "svc-ecg" },
  { slug: "lab", name: "Laboratory Services", imageSlot: "svc-lab" },
  { slug: "home-sample", name: "Home Blood Sample Collection", imageSlot: "svc-home-sample" },
];

/** Six featured services on Home, in display order. */
export const HOME_SERVICE_SLUGS = ["diabetes", "gdm", "hypertension", "thyroid", "general", "weight"] as const;
export const HOME_SERVICES = HOME_SERVICE_SLUGS.map((slug) => SERVICES.find((s) => s.slug === slug)!);
