import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GA_MEASUREMENT_ID } from "@/config/site";

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const read = (f: string) => fs.readFileSync(f, "utf8");
const count = (text: string, needle: string) => text.split(needle).length - 1;

const LAYOUT = path.join("src", "app", "layout.tsx");
const SITE_CONFIG = path.join("src", "config", "site.ts");

describe("Google Analytics tag", () => {
  it("measurement ID is the confirmed G-H699T8EXKC, defined once in config", () => {
    expect(GA_MEASUREMENT_ID).toBe("G-H699T8EXKC");
  });

  it("the root layout loads the gtag script exactly once and configures the ID exactly once", () => {
    const layout = read(LAYOUT);
    expect(count(layout, "https://www.googletagmanager.com/gtag/js?id=")).toBe(1);
    expect(count(layout, "gtag('config', '${GA_MEASUREMENT_ID}')")).toBe(1);
    expect(layout).toContain('from "next/script"');
    expect(layout).toContain('strategy="afterInteractive"');
    // The layout reads the ID from config; it never hardcodes the literal.
    expect(layout).not.toContain("G-H699T8EXKC");
    expect(layout).toMatch(/import \{[^}]*GA_MEASUREMENT_ID[^}]*\} from "@\/config\/site"/);
  });

  it("the literal ID appears in src only in config/site.ts", () => {
    for (const f of walk("src")) {
      if (f === SITE_CONFIG) continue;
      expect(read(f), f).not.toContain("G-H699T8EXKC");
    }
    expect(count(read(SITE_CONFIG), "G-H699T8EXKC")).toBe(1);
  });

  it("no page or component adds its own analytics tag (tag lives in the layout only)", () => {
    for (const f of walk("src")) {
      if (f === LAYOUT) continue;
      const text = read(f);
      expect(text, f).not.toMatch(/googletagmanager|gtag\(|dataLayer|next\/script/);
    }
  });
});
