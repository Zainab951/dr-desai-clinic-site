import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_LOCATIONS, directionsLink, LOCATIONS, MAP, MMC, timingLines, waLocationHref } from "@/config/site";

const withCoords = ALL_LOCATIONS.filter((l) => l.lat !== undefined && l.lng !== undefined);
const withMapLinks = ALL_LOCATIONS.filter((l) => l.mapsUrl !== undefined);
const withEmbed = ALL_LOCATIONS.filter((l) => l.mapsEmbedSrc !== undefined);

describe("locations (single source of truth)", () => {
  it("has the four locations, in doc order: Kanjurmarg, Pancholi, Powai, Nahar", () => {
    expect(ALL_LOCATIONS.map((l) => l.name)).toEqual([
      "Dr. Desai's Health Clinic and Diabetes Center",
      "Pancholi Hospital",
      "Powai Polyclinic & Hospital",
      "Nahar Medical Center",
    ]);
    expect(ALL_LOCATIONS.length).toBe(4);
    expect(LOCATIONS.pancholi.address.oneLine).toBe("90 Feet Rd, Sudarshan Society, Garodia Nagar, Ghatkopar East, Mumbai, Maharashtra 400077");
    expect(LOCATIONS.pancholi.weekly.text).toBe("12:00 PM to 2:00 PM");
    expect(timingLines(LOCATIONS.pancholi)).toEqual(["Monday to Saturday: 12:00 PM to 2:00 PM"]);
    expect(LOCATIONS.main.address.oneLine).toBe("1/5, Jerry Villa, Gomes Colony, Opp. Runwal Bliss main gate, Kanjurmarg (East), Mumbai 400042");
    expect(LOCATIONS.powai.address.oneLine).toBe("19/A, Opp. I.I.T. Main Gate Rd, near South Indian Bank, Powai, Mumbai, Maharashtra 400076");
    expect(LOCATIONS.nahar.address.oneLine).toBe("Nahar Amrit Shakti, off Saki Vihar Road, Chandivali, Andheri East, Mumbai 400072");
    expect(LOCATIONS.main.weekly.text).toBe("9:30 AM to 11:30 AM and 8:00 PM to 10:00 PM");
    expect(LOCATIONS.powai.weekly.text).toBe("3:00 PM to 4:00 PM");
    expect(timingLines(LOCATIONS.powai)).toEqual(["Monday to Saturday: 3:00 PM to 4:00 PM"]);
    expect(timingLines(LOCATIONS.main)).toEqual(["Monday to Saturday: 9:30 AM to 11:30 AM and 8:00 PM to 10:00 PM"]);
    expect(timingLines(LOCATIONS.nahar)).toEqual(["Monday to Saturday: 4:00 PM to 7:30 PM"]);
    expect(LOCATIONS.nahar.weekly.text).toBe("4:00 PM to 7:30 PM");
    expect(LOCATIONS.nahar.sunday).toEqual({ status: "appointment", text: "11:00 AM to 1:00 PM, by appointment only" });
    expect(LOCATIONS.main.sunday).toEqual({ status: "none" });
    expect(LOCATIONS.powai.sunday).toEqual({ status: "none" });
  });

  it("keeps carried-over fees and distances; Pancholi has none (not given, not invented)", () => {
    expect([LOCATIONS.nahar.fee, LOCATIONS.nahar.distance]).toEqual(["₹1,100", "~6 km from clinic"]);
    expect([LOCATIONS.powai.fee, LOCATIONS.powai.distance]).toEqual(["₹500", "~3 km from clinic"]);
    expect([LOCATIONS.pancholi.fee, LOCATIONS.pancholi.distance]).toEqual([undefined, undefined]);
  });

  it("has the confirmed coordinates", () => {
    expect([LOCATIONS.main.lat, LOCATIONS.main.lng]).toEqual([19.1326889, 72.9363187]);
    expect([LOCATIONS.nahar.lat, LOCATIONS.nahar.lng]).toEqual([19.1114738, 72.8977022]);
    expect([LOCATIONS.powai.lat, LOCATIONS.powai.lng]).toEqual([19.1240698, 72.9164363]);
  });

  it("Pancholi: no coordinates or short map link; embed is the owner-supplied pb URL; directions use the address", () => {
    const addr = LOCATIONS.pancholi.address.oneLine;
    expect([LOCATIONS.pancholi.lat, LOCATIONS.pancholi.lng]).toEqual([undefined, undefined]);
    expect(LOCATIONS.pancholi.mapsUrl).toBeUndefined();
    expect(LOCATIONS.pancholi.mapsEmbedSrc).toBe("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2911.539646226586!2d72.90322777381644!3d19.074155852033364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c625c5b56f45%3A0x6083c510e533025e!2sPancholi%20Hospital!5e1!3m2!1sen!2sin!4v1793691594837!5m2!1sen!2sin");
    expect(MAP.embedUrl(LOCATIONS.pancholi)).toBe("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2911.539646226586!2d72.90322777381644!3d19.074155852033364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c625c5b56f45%3A0x6083c510e533025e!2sPancholi%20Hospital!5e1!3m2!1sen!2sin!4v1793691594837!5m2!1sen!2sin");
    expect(MAP.embedUrl(LOCATIONS.pancholi)).toContain("/maps/embed?pb=");
    expect(MAP.embedUrl(LOCATIONS.pancholi)).not.toMatch(/q=|output=embed/);
    expect(directionsLink(LOCATIONS.pancholi)).toBe(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`);
    expect(new URL(directionsLink(LOCATIONS.pancholi)).searchParams.get("destination")).toBe(addr);
  });

  it("Get Directions is a coordinate-based directions link, no API key, never empty; only for locations with coordinates", () => {
    for (const l of withCoords) {
      const href = directionsLink(l)!;
      expect(href.startsWith("https://www.google.com/maps/dir/?api=1&destination=")).toBe(true);
      expect(href).toContain(`${l.lat},${l.lng}`);
      expect(href).toBe(`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`);
      const u = new URL(href);
      expect(u.searchParams.get("destination")).toBe(`${l.lat},${l.lng}`);
      expect(u.searchParams.has("key")).toBe(false);
    }
    expect(withCoords.map((l) => l.slug)).toEqual(["main", "powai", "nahar"]);
    expect(ALL_LOCATIONS.every((l) => directionsLink(l).startsWith("https://www.google.com/maps/dir/?api=1&destination="))).toBe(true);
    expect(new Set(withCoords.map(directionsLink)).size).toBe(3);
  });

  it("WhatsApp message names THAT location, URL-encoded", () => {
    for (const l of ALL_LOCATIONS) {
      const href = waLocationHref(l);
      expect(href).toContain(encodeURIComponent(`Hi, I would like to book an appointment at ${l.name}.`));
      expect(new URL(href).searchParams.get("text")).toBe(`Hi, I would like to book an appointment at ${l.name}.`);
    }
  });

  it("every location with coordinates yields a Get Directions href; every location with an embed yields an iframe src", () => {
    for (const l of withCoords) {
      const u = directionsLink(l)!;
      expect(u.length).toBeGreaterThan(20);
      expect(new URL(u).protocol).toBe("https:");
    }
    for (const l of withEmbed) {
      const u = MAP.embedUrl(l)!;
      expect(u.length).toBeGreaterThan(20);
      expect(new URL(u).protocol).toBe("https:");
    }
    expect(withEmbed.map((l) => l.slug)).toEqual(["main", "pancholi", "powai", "nahar"]);
  });

  it("no address-query fallback: a location without mapsEmbedSrc has no embed; mapsUrl no longer drives directions", () => {
    const bare = { ...LOCATIONS.powai, mapsEmbedSrc: undefined };
    expect(MAP.embedUrl(bare)).toBeUndefined();
    const withLinks = { ...LOCATIONS.powai, mapsUrl: "https://maps.app.goo.gl/example" };
    expect(directionsLink(withLinks)).toBe(directionsLink(LOCATIONS.powai));
  });

  it("real Google Maps links: short links, embed pb URLs, each with its own place name, all different (Kanjurmarg, Powai, Nahar)", () => {
    for (const l of withMapLinks) {
      expect(l.mapsUrl?.startsWith("https://maps.app.goo.gl/")).toBe(true);
      expect(l.mapsEmbedSrc?.startsWith("https://www.google.com/maps/embed?pb=")).toBe(true);
      expect(MAP.embedUrl(l)).toBe(l.mapsEmbedSrc);
    }
    expect(LOCATIONS.main.mapsEmbedSrc).toContain("Dr.%20Desai's");
    expect(LOCATIONS.nahar.mapsEmbedSrc).toContain("Nahar%20Medical%20Center");
    expect(LOCATIONS.powai.mapsEmbedSrc).toContain("Powai%20Polyclinic");
    expect(withMapLinks.length).toBe(3);
    expect(new Set(withMapLinks.map((l) => l.mapsUrl)).size).toBe(3);
    expect(new Set(withEmbed.map((l) => l.mapsEmbedSrc)).size).toBe(4);
  });

  it("no maps/search links anywhere in src", () => {
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const f of walk("src")) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/maps\/search/);
  });

  it("only the Kanjurmarg clinic is bookable", () => {
    expect(ALL_LOCATIONS.filter((l) => l.bookable).map((l) => l.slug)).toEqual(["main"]);
  });

  it("MMC number is defined once", () => {
    expect(MMC.number).toBe("2016040659");
  });
});
