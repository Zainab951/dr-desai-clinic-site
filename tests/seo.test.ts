import { describe, expect, it } from "vitest";
import { BRANCHES, EMAIL, LOCATIONS, MMC, PHONE, SITE, SOCIAL } from "@/config/site";
import { breadcrumbSchema, clinicSchema, pageMetadata, physicianSchema } from "@/lib/seo";

const all = JSON.stringify([clinicSchema(), physicianSchema(), breadcrumbSchema([{ name: "Home", path: "/" }])]);

describe("site host in schema", () => {
  const HOST = "https://www.drdesaihealthclinic.com";
  it("clinic and physician @id / url use the real host", () => {
    expect(SITE.url).toBe(HOST);
    const c = clinicSchema();
    expect(c["@id"]).toBe(`${HOST}/#clinic`);
    expect(c.url).toBe(HOST);
    const p = physicianSchema();
    expect(p["@id"]).toBe(`${HOST}/#physician`);
    expect(p.url).toBe(`${HOST}/about`);
    expect(p.worksFor).toEqual({ "@id": `${HOST}/#clinic` });
  });

  it("breadcrumb items use the real host", () => {
    const b = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]);
    expect(b.itemListElement.map((i) => i.item)).toEqual([`${HOST}/`, `${HOST}/about`]);
  });
});

describe("schema", () => {
  it("clinic schema has the single phone, landmark address and Mon-Sat hours", () => {
    const c = clinicSchema();
    expect(c.telephone).toBe(PHONE.tel);
    expect(c.address.streetAddress).toContain("Opp. Runwal Bliss main gate");
    expect(c.address.postalCode).toBe("400042");
    expect(c["@type"]).toContain("MedicalClinic");
    expect(c.openingHoursSpecification).toHaveLength(2);
    expect(c.openingHoursSpecification.map((h) => [h.opens, h.closes])).toEqual([
      ["09:30", "11:30"],
      ["20:00", "22:00"],
    ]);
    expect(c.openingHoursSpecification[0].dayOfWeek).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  });

  it("clinic schema has hasMap (Kanjurmarg mapsUrl) and GeoCoordinates, nothing else new", () => {
    const c = clinicSchema();
    expect(c.hasMap).toBe("https://maps.app.goo.gl/v1pZJ3r3GSakVRnK7");
    expect(c.geo).toEqual({ "@type": "GeoCoordinates", latitude: 19.1326889, longitude: 72.9363187 });
    expect(physicianSchema()).not.toHaveProperty("hasMap");
    expect(physicianSchema()).not.toHaveProperty("geo");
  });

  it("Physician carries MMC identifier and Powai + Nahar work locations", () => {
    const p = physicianSchema();
    expect(p.identifier).toEqual({
      "@type": "PropertyValue",
      name: "Maharashtra Medical Council registration number",
      value: MMC.number,
    });
    expect(p.workLocation.map((w) => w.name)).toEqual(BRANCHES.map((b) => b.name));
    for (const w of p.workLocation) {
      expect(w["@type"]).toBe("Place");
      expect(w.address["@type"]).toBe("PostalAddress");
      expect(w.openingHoursSpecification.length).toBeGreaterThan(0);
    }
    const powai = p.workLocation.find((w) => w.name === LOCATIONS.powai.name)!;
    expect(powai.address.postalCode).toBe("400076");
    expect(powai.openingHoursSpecification.map((h) => [h.opens, h.closes])).toEqual([["15:00", "16:00"]]);
    expect(JSON.stringify(powai.openingHoursSpecification)).not.toMatch(/validFrom|validThrough|17:30/);
    const nahar = p.workLocation.find((w) => w.name === LOCATIONS.nahar.name)!;
    expect(nahar.address.postalCode).toBe("400072");
    expect(nahar.openingHoursSpecification.map((h) => [h.opens, h.closes])).toEqual([["16:00", "19:30"]]);
    expect(p.workLocation.map((w) => w.name)).toEqual(["Pancholi Hospital", LOCATIONS.powai.name, LOCATIONS.nahar.name]);
  });

  it("Nahar Sunday is a text note, never openingHours; main Sunday absent", () => {
    const nahar = physicianSchema().workLocation.find((w) => w.name === LOCATIONS.nahar.name)!;
    expect("description" in nahar && nahar.description).toContain("11:00 AM to 1:00 PM, by appointment only");
    const specs = JSON.stringify([clinicSchema().openingHoursSpecification, ...physicianSchema().workLocation.map((w) => w.openingHoursSpecification)]);
    expect(specs).not.toMatch(/Sunday/);
    expect(JSON.stringify(clinicSchema())).not.toMatch(/Sunday/);
  });

  it("clinic sameAs lists exactly the two confirmed social URLs", () => {
    expect(clinicSchema().sameAs).toEqual([
      "https://www.instagram.com/fat.docdiaries",
      "https://www.facebook.com/share/1F41VxgMqf/",
    ]);
    expect(clinicSchema().sameAs).toEqual(SOCIAL.map((s) => s.href));
  });

  it("has no email field and no bracket placeholders in schema", () => {
    expect(all).not.toContain(EMAIL);
    expect(all).not.toMatch(/email/i);
    expect(all).not.toMatch(/\[[A-Z ]+\]/);
  });

  it("has no FAQPage markup (FAQ removed)", () => {
    expect(all).not.toMatch(/FAQPage|Question/);
  });
});

describe("metadata", () => {
  it("sets title, description and canonical", () => {
    const m = pageMetadata({ title: "T", description: "D", path: "/about" });
    expect(m.alternates?.canonical).toBe("https://www.drdesaihealthclinic.com/about");
    expect((m.openGraph as { url?: string }).url).toBe("https://www.drdesaihealthclinic.com/about");
    expect(m.title).toBe("T");
    expect(m.description).toBe("D");
  });
});
