import { ALL_LOCATIONS, FEES, MAIN, MMC, PHONE, SITE } from "@/config/site";

export const dynamic = "force-static";

/** llms.txt: plain-text summary for AI crawlers. Confirmed facts only (no placeholders). */
export function GET() {
  const locations = ALL_LOCATIONS.map((l) => {
    const sunday = l.sunday.status === "appointment" ? `; Sunday: ${l.sunday.text}` : "";
    return `- ${l.name}: ${l.address.oneLine}. ${l.weekly.days}, ${l.weekly.text}${sunday}`;
  }).join("\n");
  const body = `# ${SITE.clinicName}

> ${SITE.doctorName}, ${SITE.doctorTitle} (${SITE.qualifications}). Diabetes and general medicine clinic in Kanjurmarg East, Mumbai.

## Doctor
- ${MMC.council} registration number: ${MMC.number}

## Locations
${locations}

## Contact
- Phone / WhatsApp: ${PHONE.display}
- Main clinic landmark: ${MAIN.address.landmark}
- Consultation fee at the Kanjurmarg clinic: ${FEES.first} first visit, ${FEES.followUp} follow-up
- Booking is by phone or WhatsApp; there is no online booking calendar.

## Pages
- [Home](${SITE.url}/): Diabetes doctor in Kanjurmarg East, Mumbai
- [About](${SITE.url}/about): Doctor qualifications and approach
- [Services](${SITE.url}/services): Diabetes, GDM, hypertension, thyroid, ECG, lab and more
- [Contact & Visit Us](${SITE.url}/contact): Map, timings, call, WhatsApp and other consulting locations
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
