import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Timings } from "@/components/LocationBits";
import { EXPERIENCE, LOCATIONS } from "@/config/site";

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const homeSrc = fs.readFileSync("src/app/page.tsx", "utf8");

describe("Home content rules", () => {
  it("experience is 6 years, defined once, and '6+' appears nowhere in src", () => {
    expect(EXPERIENCE.years).toBe("6");
    for (const f of walk("src")) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/6\+/);
  });

  it("has no locations strip; sections follow the approved order", () => {
    expect(homeSrc).not.toMatch(/Where to meet|home-locations|meet-heading/);
    const order = ["hero-heading", "about-heading", 'aria-label="Our approach"', "services-heading", "why-heading", "glance-heading", "Reasons to choose Dr. Desai", "visit-heading", "<ClosingCta"];
    const at = order.map((k) => homeSrc.indexOf(k));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("step 1 mentions walk-ins", () => {
    expect(homeSrc).toContain("Call or WhatsApp to book. Walk-ins are also seen.");
  });
});

describe("Sunday display", () => {
  it("main clinic shows Mon to Sat only: no Sunday line, no 'closed', no placeholder", () => {
    const html = renderToStaticMarkup(createElement(Timings, { loc: LOCATIONS.main }));
    expect(html).toContain("Monday to Saturday: 9:30 AM to 11:30 AM and 8:00 PM to 10:00 PM");
    expect(html).not.toMatch(/Sunday|closed|data-placeholder/i);
  });

  it("Nahar keeps its Sunday appointment note", () => {
    const html = renderToStaticMarkup(createElement(Timings, { loc: LOCATIONS.nahar }));
    expect(html).toContain("Sunday: 11:00 AM to 1:00 PM, by appointment only");
  });

  it("no TODO(confirm) markers remain", () => {
    for (const f of walk("src")) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/TODO\(confirm\)/);
  });
});
