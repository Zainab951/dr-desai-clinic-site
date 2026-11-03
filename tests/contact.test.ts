import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ContactPage from "@/app/contact/page";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { ALL_LOCATIONS, directionsLink, EMAIL, EMAIL_SUBJECT, mailtoHref, mailtoLink, LOCATIONS, MAP, PHONE } from "@/config/site";

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const read = (f: string) => fs.readFileSync(f, "utf8");

const html = renderToStaticMarkup(createElement(ContactPage));
const at = (marker: string) => html.indexOf(marker);
const mainSeg = html.slice(at('data-location="main"'), at("Also consults at"));
const naharSeg = html.slice(at('data-location="nahar"'), html.indexOf("</section>", at('data-location="nahar"')));
const powaiSeg = html.slice(at('data-location="powai"'), html.indexOf("</section>", at('data-location="powai"')));
const pancholiSeg = html.slice(at('data-location="pancholi"'), at('data-location="powai"'));

describe("email", () => {
  it("one shared helper builds the mailto with the appointment subject", () => {
    expect(mailtoLink()).toBe("mailto:samruddh24@gmail.com?subject=Appointment%20enquiry");
    expect(mailtoHref).toBe(mailtoLink());
    const u = new URL(mailtoHref);
    expect(u.protocol).toBe("mailto:");
    expect(u.pathname).toBe(EMAIL);
    expect(u.searchParams.get("subject")).toBe(EMAIL_SUBJECT);
  });

  it("'mailto:' and the Gmail URL are built only in config; header, footer and Contact use the shared EmailLink", () => {
    for (const f of walk("src")) if (!f.endsWith("config/site.ts")) expect(read(f), f).not.toMatch(/mailto:|mail\.google\.com/);
    for (const f of ["src/components/Header.tsx", "src/components/Footer.tsx", "src/app/contact/page.tsx"]) expect(read(f), f).toContain("<EmailLink");
    expect(read("src/components/EmailLink.tsx")).toContain("mailtoHref");
    expect(read("src/components/EmailLink.tsx")).toContain("gmailComposeLink");
  });

  it("no other email address exists anywhere in src or public", () => {
    const found = new Set<string>();
    for (const f of [...walk("src"), ...walk("public").filter((p) => /\.(txt|md|json|xml|html|svg)$/.test(p))]) {
      for (const m of read(f).matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) found.add(m[0]);
    }
    expect([...found]).toEqual([EMAIL]);
  });

  it("Contact main card has 'Email us' (mailto) and the Copy email button; no form", () => {
    expect(mainSeg).toContain(`href="${mailtoHref}"`);
    expect(mainSeg).toContain("Email us");
    expect(mainSeg).toContain("data-copy-email");
    expect(mainSeg).toContain("Copy email");
    expect(html).not.toMatch(/<form|<input|<textarea/);
  });

  it("copy button announces politely and is a real button", () => {
    const b = renderToStaticMarkup(createElement(CopyEmailButton));
    expect(b).toContain('type="button"');
    expect(b).toContain('aria-live="polite"');
    expect(b).toContain("min-h-[44px]");
  });
});

describe("booking actions only on the Kanjurmarg clinic card", () => {
  const TEL = `tel:${PHONE.tel}`;
  const WA = `wa.me/${PHONE.whatsapp}`;

  it("main card has Call, WhatsApp and Get Directions", () => {
    expect(mainSeg).toContain(TEL);
    expect(mainSeg).toContain(WA);
    expect(mainSeg).toContain("Get Directions");
  });

  it("Nahar and Powai cards have no tel:, wa.me, Call or Book buttons, but keep directions, address, timings, fee", () => {
    for (const [seg, loc] of [[naharSeg, LOCATIONS.nahar], [powaiSeg, LOCATIONS.powai]] as const) {
      expect(seg).not.toMatch(/tel:|wa\.me|mailto:/);
      expect(seg).not.toMatch(/Book on WhatsApp|data-cta="call"|data-cta="whatsapp"/);
      expect(seg).toContain("Get Directions");
      expect(seg).toContain(loc.address.lines[0].replace(/&/g, "&amp;"));
      expect(seg).toContain(loc.weekly.text);
      expect(seg).toContain(`Fee ${loc.fee}`);
    }
  });

  it("every tel: and wa.me on the Contact page sits inside the main clinic card", () => {
    const mainStart = at('data-location="main"');
    const mainEnd = at("Also consults at");
    for (const m of html.matchAll(/tel:|wa\.me/g)) {
      expect(m.index!).toBeGreaterThanOrEqual(mainStart);
      expect(m.index!).toBeLessThan(mainEnd);
    }
  });
});

describe("Google Maps wiring on Contact", () => {
  const decode = (v: string) => v.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

  it("renders 4 lazy iframes (Kanjurmarg, Pancholi, Powai, Nahar), each 250px tall, with a title and referrerPolicy", () => {
    const tags = [...html.matchAll(/<iframe\b[^>]*>/g)].map((m) => m[0]);
    expect(tags).toHaveLength(4);
    expect(tags.map((t) => decode(/ src="([^"]*)"/.exec(t)![1]))).toEqual(ALL_LOCATIONS.map((l) => MAP.embedUrl(l)));
    expect(html.match(/h-\[250px\]/g)).toHaveLength(4);
    expect(decode(tags[1])).toContain("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2911.539646226586");
    for (const t of tags) {
      expect(t).toMatch(/ title="[^"]+"/);
      expect(t).toContain('loading="lazy"');
      expect(t).toContain('referrerPolicy="no-referrer-when-downgrade"');
    }
  });

  it("renders 4 Get Directions buttons: coordinate links for Kanjurmarg, Powai, Nahar; address link for Pancholi", () => {
    const anchors = [...html.matchAll(/<a\b[^>]*data-cta="directions"[^>]*>/g)].map((m) => m[0]);
    expect(anchors).toHaveLength(4);
    expect(anchors.map((a) => decode(/ href="([^"]*)"/.exec(a)![1]))).toEqual(ALL_LOCATIONS.map(directionsLink));
    for (const a of anchors) expect(a).toContain('rel="noopener noreferrer"');
  });

  it("Pancholi card: name, plain address, timings; no phone, WhatsApp, Call, directions, map or photo", () => {
    expect(pancholiSeg).toContain("Pancholi Hospital");
    expect(pancholiSeg).toContain("90 Feet Rd, Sudarshan Society, Garodia Nagar");
    expect(pancholiSeg).toContain("Monday to Saturday: 12:00 PM to 2:00 PM");
    expect(pancholiSeg).toContain("<iframe");
    expect(pancholiSeg).toContain("Get Directions");
    expect(pancholiSeg).not.toMatch(/tel:|wa\.me|data-cta="(call|whatsapp)"|Fee |fee/);
    expect(html.indexOf('data-location="pancholi"')).toBeLessThan(html.indexOf('data-location="powai"'));
    expect(html.indexOf('data-location="powai"')).toBeLessThan(html.indexOf('data-location="nahar"'));
  });

  it("fee text per card is exactly as live; Pancholi has no fee or distance line", () => {
    expect(html).toContain("Consultation fee: ₹500 first visit, ₹300 follow-up.");
    expect(html).toContain("Fee ₹500 · ~3 km from clinic");
    expect(html).toContain("Fee ₹1,100 · ~6 km from clinic");
    expect(pancholiSeg).not.toMatch(/\bFee\b|km from clinic/);
  });
});
