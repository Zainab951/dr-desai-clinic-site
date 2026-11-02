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
  it("DOM order: heading, para A, para B, tags, About Me, P1, P2, P3, cards, Our approach", () => {
    const A = "Consultant Physician and Diabetologist, MBBS, FCPS Medicine (Rajawadi Hospital, Mumbai), CCGDM (PHFI Chennai).";
    const A2 = "Registered with the Maharashtra Medical Council (MMC), Reg. No. 2016040659.";
    const B = "Consults at Dr. Desai's Health Clinic and Diabetes Center, focused on clear explanations and treatment plans built around each patient's daily routine.";
    expect(html).toContain(`>${B}</p>`);
    expect(html).toContain(A);
    expect(html).toContain(A2);
    expect(html).toContain("6 years in internal medicine, with a focus on diabetes management.");
    const order = [
      html.indexOf("A clinic built around clear, patient-first care"),
      html.indexOf(A),
      html.indexOf(`>${B}</p>`),
      html.indexOf(">Diabetes</li>"),
      html.indexOf(">General Medicine</li>"),
      html.indexOf(">About Me</h2>"),
      html.indexOf(`>${P1}</p>`),
      html.indexOf(`>${P2}</p>`),
      html.indexOf(`>${P3}</p>`),
      html.indexOf("data-about-cards"),
      html.indexOf("Our approach"),
    ];
    order.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect(order).toEqual([...order].sort((x, y) => x - y));
  });
  it("About Me lives in the same column as the intro (no sibling block above or below the photo)", () => {
    const photo = html.indexOf('data-slot-id="about-doctor"');
    expect(photo).toBeGreaterThan(-1);
    expect(photo).toBeLessThan(html.indexOf("A clinic built around"));
    expect(html.indexOf("data-about-me")).toBeGreaterThan(html.indexOf(">General Medicine</li>"));
    expect(html.indexOf("data-about-me")).toBeLessThan(html.indexOf("data-about-cards"));
  });
  it("photo frame ratio matches the file (800x1200), object-cover", () => {
    expect(html).toContain("aspect-ratio:800 / 1200");
    expect(html).toContain('class="object-cover"');
  });
  it("copy is not hardcoded in the page component", () => {
    expect(fs.readFileSync("src/app/about/page.tsx", "utf8")).not.toContain("After completing my training");
  });
});
