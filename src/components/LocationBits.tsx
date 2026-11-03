import type { Location } from "@/config/site";
import { directionsLink, timingLines, telHref, waLocationHref } from "@/config/site";
import { DirectionsIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

/** Mon-Sat line, plus a Sunday line only when config has an appointment note. */
export function Timings({ loc }: { loc: Location }) {
  return (
    <div className="text-[16px] leading-[1.7] text-body" data-timings={loc.slug}>
      {timingLines(loc).map((line) => <p key={line}>{line}</p>)}
      {loc.sunday.status === "appointment" && <p>Sunday: {loc.sunday.text}</p>}
    </div>
  );
}

const btn = "fx-btn inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2.5 text-[15px] sm:gap-2 sm:px-4 sm:text-[16px] font-bold transition-colors";

/**
 * Get Directions always. Call + Book on WhatsApp ONLY when `loc.bookable` (Kanjurmarg clinic).
 * +91 88305 31546 belongs to the Kanjurmarg clinic only; the doctor has a no-promotion clause with Nahar.
 */
export function LocationActions({ loc }: { loc: Location }) {
  const directions = directionsLink(loc);
  if (!loc.bookable && !directions) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2" data-location-actions={loc.slug}>
      {loc.bookable && (
        <a href={waLocationHref(loc)} target="_blank" rel="noopener noreferrer" className={`${btn} col-span-2 border border-teal-800 bg-teal-800 text-white hover:bg-teal-950`} data-cta="whatsapp">
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          Book on WhatsApp
        </a>
      )}
      {directions && (
        <a href={directions} target="_blank" rel="noopener noreferrer" className={`${btn} ${loc.bookable ? "" : "col-span-2"} border border-teal-800 bg-white text-teal-800 hover:bg-teal-50`} data-cta="directions">
          <DirectionsIcon className="h-[18px] w-[18px]" />
          Get Directions
        </a>
      )}
      {loc.bookable && (
        <a href={telHref} className={`${btn} border border-teal-800 bg-white text-teal-800 hover:bg-teal-50`} data-cta="call">
          <PhoneIcon className="h-[18px] w-[18px]" />
          Call
        </a>
      )}
    </div>
  );
}
