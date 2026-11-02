import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_LOCATIONS, directionsLink, LOCATIONS, MAP, MMC, timingLines, waLocationHref } from "@/config/site";

describe("locations (single source of truth)", () => {
  it("has the three confirmed locations", () => {
    expect(ALL_LOCATIONS.map((l) => l.name)).toEqual([
      "Dr. Desai's Health Clinic and Diabetes Center",
      "Nahar Medical Center",
      "Powai Polyclinic & Hospital",
    ]);
    expect(LOCATIONS.main.address.oneLine).toBe("1/5, Jerry Villa, Gomes Colony, Opp. Runwal Bliss main gate, Kanjurmarg (East), Mumbai 400042");
    expect(LOCATIONS.powai.address.oneLine).toBe("19/A, Opp. I.I.T. Main Gate Rd, near South Indian Bank, Powai, Mumbai, Maharashtra 400076");
    expect(LOCATIONS.nahar.address.oneLine).toBe("Nahar Amrit Shakti, off Saki Vihar Road, Chandivali, Andheri East, Mumbai 400072");
    expect(LOCATIONS.main.weekly.text).toBe("9:30 am to 11:30 am and 8:00 pm to 10:00 pm");
    expect(LOCATIONS.powai.weekly.text).toBe("3:00 pm to 4:00 pm");
    expect(timingLines(LOCATIONS.powai)).toEqual(["Monday to Saturday: 3:00 pm to 4:00 pm"]);
    expect(timingLines(LOCATIONS.main)).toEqual(["Monday to Saturday: 9:30 am to 11:30 am and 8:00 pm to 10:00 pm"]);
    expect(timingLines(LOCATIONS.nahar)).toEqual(["Monday to Saturday: 12:00 pm to 2:00 pm and 6:00 pm to 7:30 pm"]);
    expect(LOCATIONS.nahar.weekly.text).toBe("12:00 pm to 2:00 pm and 6:00 pm to 7:30 pm");
    expect(LOCATIONS.nahar.sunday).toEqual({ status: "appointment", text: "By appointment only, 11:00 am to 1:00 pm" });
    expect(LOCATIONS.main.sunday).toEqual({ status: "none" });
    expect(LOCATIONS.powai.sunday).toEqual({ status: "none" });
  });

  it("keeps carried-over fees and distances", () => {
    expect([LOCATIONS.nahar.fee, LOCATIONS.nahar.distance]).toEqual(["₹1,100", "~6 km from clinic"]);
    expect([LOCATIONS.powai.fee, LOCATIONS.powai.distance]).toEqual(["₹500", "~3 km from clinic"]);
  });

  it("has the confirmed coordinates", () => {
    expect([LOCATIONS.main.lat, LOCATIONS.main.lng]).toEqual([19.1326889, 72.9363187]);
    expect([LOCATIONS.nahar.lat, LOCATIONS.nahar.lng]).toEqual([19.1114738, 72.8977022]);
    expect([LOCATIONS.powai.lat, LOCATIONS.powai.lng]).toEqual([19.1240698, 72.9164363]);
  });

  it("Get Directions is a coordinate-based directions link, no API key, never empty", () => {
    for (const l of ALL_LOCATIONS) {
      const href = directionsLink(l);
      expect(href.startsWith("https://www.google.com/maps/dir/?api=1&destination=")).toBe(true);
      expect(href).toContain(`${l.lat},${l.lng}`);
      expect(href).toBe(`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`);
      const u = new URL(href);
      expect(u.searchParams.get("destination")).toBe(`${l.lat},${l.lng}`);
      expect(u.searchParams.has("key")).toBe(false);
    }
    expect(new Set(ALL_LOCATIONS.map(directionsLink)).size).toBe(3);
  });

  it("WhatsApp message names THAT location, URL-encoded", () => {
    for (const l of ALL_LOCATIONS) {
      const href = waLocationHref(l);
      expect(href).toContain(encodeURIComponent(`Hi, I would like to book an appointment at ${l.name}.`));
      expect(new URL(href).searchParams.get("text")).toBe(`Hi, I would like to book an appointment at ${l.name}.`);
    }
  });

  it("every location yields a Get Directions href and an iframe src, never empty", () => {
    for (const l of ALL_LOCATIONS) {
      for (const u of [directionsLink(l), MAP.embedUrl(l)]) {
        expect(u.length).toBeGreaterThan(20);
        expect(new URL(u).protocol).toBe("https:");
      }
    }
  });

  it("embed falls back to an address query for a location without mapsEmbedSrc; mapsUrl no longer drives directions", () => {
    const bare = { ...LOCATIONS.powai, mapsEmbedSrc: undefined };
    expect(MAP.embedUrl(bare)).toContain("output=embed");
    const withLinks = { ...LOCATIONS.powai, mapsUrl: "https://maps.app.goo.gl/example" };
    expect(directionsLink(withLinks)).toBe(directionsLink(LOCATIONS.powai));
  });

  it("real Google Maps links: short links, embed pb URLs, each with its own place name, all different", () => {
    for (const l of ALL_LOCATIONS) {
      expect(l.mapsUrl?.startsWith("https://maps.app.goo.gl/")).toBe(true);
      expect(l.mapsEmbedSrc?.startsWith("https://www.google.com/maps/embed?pb=")).toBe(true);
      expect(MAP.embedUrl(l)).toBe(l.mapsEmbedSrc);
    }
    expect(LOCATIONS.main.mapsEmbedSrc).toContain("Dr.%20Desai's");
    expect(LOCATIONS.nahar.mapsEmbedSrc).toContain("Nahar%20Medical%20Center");
    expect(LOCATIONS.powai.mapsEmbedSrc).toContain("Powai%20Polyclinic");
    expect(new Set(ALL_LOCATIONS.map((l) => l.mapsUrl)).size).toBe(3);
    expect(new Set(ALL_LOCATIONS.map((l) => l.mapsEmbedSrc)).size).toBe(3);
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
