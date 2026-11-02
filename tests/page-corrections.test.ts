import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClosingCta } from "@/components/ClosingCta";
import { PHONE, LOCATIONS } from "@/config/site";
import { Timings } from "@/components/LocationBits";

const read = (f: string) => fs.readFileSync(f, "utf8");

describe("Services closing CTA", () => {
  const src = read("src/app/services/page.tsx");
  it("sits after the nutrition block, uses the shared ClosingCta", () => {
    expect(src.indexOf("Personalized nutrition guidance")).toBeLessThan(src.indexOf("<ClosingCta"));
    expect(src).toContain("Ready to book or have a question?");
  });
  it("Call Clinic, WhatsApp Us, Contact & Visit Us link, main number, no form", () => {
    const html = renderToStaticMarkup(createElement(ClosingCta, { showContactLink: true, title: "Ready to book or have a question?" }));
    expect(html).toContain("Call Clinic");
    expect(html).toContain("WhatsApp Us");
    expect(html).toContain(`href="tel:${PHONE.tel}"`);
    expect(html).toContain(`wa.me/${PHONE.whatsapp}`);
    expect(html).toContain('href="/contact"');
    expect(html).not.toMatch(/<form|<input|<textarea/);
  });
});

describe("About cards grid", () => {
  const src = read("src/app/about/page.tsx");
  it("5 columns at lg, 2 below lg with last card spanning full width, 1 on small mobile", () => {
    expect(src).toContain("grid-cols-1");
    expect(src).toMatch(/sm:grid-cols-2/);
    expect(src).toMatch(/lg:grid-cols-5/);
    expect(src).toContain("sm:last:col-span-2");
    expect(src).toContain("lg:last:col-span-1");
  });
});

describe("Powai timing (single line)", () => {
  it("Contact card shows only the current line", () => {
    const html = renderToStaticMarkup(createElement(Timings, { loc: LOCATIONS.powai }));
    expect(html).toContain("Monday to Saturday: 3:00 pm to 4:00 pm");
    expect(html).not.toMatch(/Until 31 October|From 1 November/);
  });
  it('"4:00 pm to 5:30 pm" and dated-timing leftovers appear nowhere in src or README', () => {
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]));
    for (const f of [...walk("src"), "README.md"]) {
      expect(read(f), f).not.toMatch(/4:00 pm to 5:30|5:30 pm|"17:30"|From 1 November|Until 31 October|validThrough/);
    }
  });
  it("no dated-timing fields on any location", () => {
    for (const l of Object.values(LOCATIONS)) {
      expect(l.weekly).not.toHaveProperty("previous");
      expect(l.weekly).not.toHaveProperty("effective");
    }
  });
});
