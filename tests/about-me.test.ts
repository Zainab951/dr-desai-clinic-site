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
  it("all 3 paragraphs appear verbatim on /about, in order, under the hero", () => {
    const at = [P1, P2, P3].map((p) => html.indexOf(`>${p}</p>`));
    at.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(html.indexOf("About Me")).toBeGreaterThan(html.indexOf("</h1>"));
    expect(html.indexOf("About Me")).toBeLessThan(html.indexOf("A clinic built around clear, patient-first care"));
  });
  it("credentials, 5 cards and Our approach are kept", () => {
    expect(html).toContain("6 years in internal medicine");
    expect(html).toContain("Our approach");
    expect(html.match(/<li class="fx-card/g)).toHaveLength(5);
  });
  it("copy is not hardcoded in the page component", () => {
    expect(fs.readFileSync("src/app/about/page.tsx", "utf8")).not.toContain("After completing my training");
  });
});
