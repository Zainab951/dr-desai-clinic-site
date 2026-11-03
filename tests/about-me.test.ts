import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AboutPage from "@/app/about/page";
import { ABOUT_ME } from "@/config/site";

const P1 = "After completing my training, I worked as a Consultant Physician in Karad, my native place, for a year, with the aim of serving the local community. I later worked at Synergy Multispeciality Hospital, Miraj, gaining valuable clinical experience in rural Maharashtra. After around four years of practice in Maharashtra, I decided to return to Mumbai, my birthplace, and establish my own clinic.";
const P2 = "I started Dr. Desai's Health Clinic and Diabetes Center in Kanjurmarg with the vision of making quality general medical care and specialised diabetes management more accessible to the local community. Recognising the need for accessible healthcare and dedicated diabetology services in the area, I wanted to create a clinic where patients could receive personalised, affordable and comprehensive medical care close to home.";
const P3 = "While my clinic was under development, I worked at Powai Polyclinic & Hospital and Nahar Medical Centre, Chandivali. This experience helped me understand the healthcare needs of Mumbai's densely populated communities, the challenges patients face in accessing medical care, and the importance of accessible, reliable physician services.";
const A = "Consultant Physician and Diabetologist, MBBS, FCPS Medicine (Rajawadi Hospital, Mumbai), CCGDM (PHFI Chennai). 6 years in internal medicine, with a focus on diabetes management. Registered with the Maharashtra Medical Council (MMC), Reg. No. 2016040659.";
const B = "Consults at Dr. Desai's Health Clinic and Diabetes Center, focused on clear explanations and treatment plans built around each patient's daily routine.";

const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');

describe("About page layout", () => {
  const html = decode(renderToStaticMarkup(createElement(AboutPage)));
  const pos = (needle: string) => {
    const i = html.indexOf(needle);
    expect(i, needle).toBeGreaterThan(-1);
    return i;
  };

  it("config holds exactly the 3 doctor paragraphs, verbatim", () => {
    expect([...ABOUT_ME]).toEqual([P1, P2, P3]);
  });

  it("DOM order: photo, name, credentials, role, divider, para A, para B, About Me, P1, P2, P3, cards, Our approach", () => {
    const order = [
      pos('data-slot-id="about-doctor"'),
      pos(">Dr. Samruddha Desai</h2>"),
      pos(">MBBS | FCPS Medicine (Rajawadi Hospital, Mumbai) | CCGDM (PHFI Chennai)</p>"),
      pos(">Consultant Physician & Diabetologist</p>"),
      pos("<hr"),
      pos(`>${A}</p>`),
      pos(`>${B}</p>`),
      pos("data-about-me"),
      pos(">About Me</h2>"),
      pos(`>${P1}</p>`),
      pos(`>${P2}</p>`),
      pos(`>${P3}</p>`),
      pos("data-about-cards"),
      pos("Our approach"),
    ];
    expect(order).toEqual([...order].sort((x, y) => x - y));
  });

  it("About Me is full width: after the photo/text grid, before the 5 cards", () => {
    const gridEnd = pos(`>${B}</p>`);
    expect(pos("data-about-me")).toBeGreaterThan(gridEnd);
    expect(pos("data-about-me")).toBeLessThan(pos("data-about-cards"));
  });

  it("photo frame keeps the file's real ratio 800 / 1200, object-cover, top-anchored", () => {
    expect(html).toContain("aspect-ratio:800 / 1200");
    expect(html).toContain('class="object-cover"');
    expect(html).toContain("object-position:center 0%");
  });

  it("5 cards and Our approach are kept", () => {
    expect(html).toContain("6 years in internal medicine");
    expect(html).toContain("Our approach");
    expect(html.match(/<li class="fx-card/g)).toHaveLength(5);
  });

  it("copy is not hardcoded in the page component", () => {
    expect(fs.readFileSync("src/app/about/page.tsx", "utf8")).not.toContain("After completing my training");
  });
});
