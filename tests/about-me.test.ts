import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AboutPage from "@/app/about/page";
import { ABOUT_ME } from "@/config/site";

const P1 = "After completing my training, I worked as a Consultant Physician in Karad, my native place, for a year, with the aim of serving the local community. I later worked at Synergy Multispeciality Hospital, Miraj, gaining valuable clinical experience in rural Maharashtra. After around four years of practice in Maharashtra, I decided to return to Mumbai, my birthplace, and establish my own clinic.";
const P2 = "I started Dr. Desai's Health Clinic and Diabetes Center in Kanjurmarg with the vision of making quality general medical care and specialised diabetes management more accessible to the local community. Recognising the need for accessible healthcare and dedicated diabetology services in the area, I wanted to create a clinic where patients could receive personalised, affordable and comprehensive medical care close to home.";
const P3 = "While my clinic was under development, I worked at Powai Polyclinic & Hospital and Nahar Medical Centre, Chandivali. This experience helped me understand the healthcare needs of Mumbai's densely populated communities, the challenges patients face in accessing medical care, and the importance of accessible, reliable physician services.";

const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');

describe("About Me", () => {
  const html = decode(renderToStaticMarkup(createElement(AboutPage)));
  it("config holds exactly the 3 doctor paragraphs, verbatim", () => {
    expect([...ABOUT_ME]).toEqual([P1, P2, P3]);
  });
  it("all 3 paragraphs appear verbatim on /about, in order, below the 5 cards and above Our approach", () => {
    const at = [P1, P2, P3].map((p) => html.indexOf(`>${p}</p>`));
    at.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(html.indexOf("About Me")).toBeGreaterThan(html.lastIndexOf("Currently pursuing"));
    expect(html.indexOf("About Me")).toBeLessThan(html.indexOf("Our approach"));
  });
  it("hero is as on production: heading, intro incl. Consults-at line, tags, photo box", () => {
    expect(html).toContain("A clinic built around clear, patient-first care");
    expect(html).toContain("Consults at Dr. Desai's Health Clinic and Diabetes Center, focused on clear explanations and treatment plans built around each patient's daily routine.");
    expect(html).toContain("Diabetes</li>");
    expect(html).toContain("General Medicine</li>");
    expect(html.indexOf("A clinic built around")).toBeLessThan(html.indexOf("About Me"));
    expect(html).toContain('data-slot-id="about-doctor"');
    expect(html).toContain("aspect-ratio:396 / 405");
  });
  it("copy is not hardcoded in the page component", () => {
    expect(fs.readFileSync("src/app/about/page.tsx", "utf8")).not.toContain("After completing my training");
  });
});
