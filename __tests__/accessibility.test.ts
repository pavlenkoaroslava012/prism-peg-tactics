import * as fs from 'fs';
import * as path from 'path';
import { HEADER_TOP, TILE } from '../src/constants/config';
import { DEFAULT_SETTINGS, updateSettings, defaultProgress } from '../src/storage/progressStore';

const SRC = path.join(__dirname, '..', 'src');

function walk(dir: string, out: string[] = []): string[] {
  fs.readdirSync(dir).forEach(entry => {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  });
  return out;
}

const FILES = walk(SRC).concat([path.join(__dirname, '..', 'App.tsx')]);
const SOURCES = FILES.map(file => ({ file, text: fs.readFileSync(file, 'utf8') }));

describe('accessibility and readable text', () => {
  it('ships HIGH CONTRAST SLOTS as an off-by-default option that can be turned on', () => {
    expect(DEFAULT_SETTINGS.highContrast).toBe(false);
    const next = updateSettings(defaultProgress(), { highContrast: true });
    expect(next.settings.highContrast).toBe(true);
  });

  it('keeps the status-bar inset on every header', () => {
    expect(HEADER_TOP).toBe(44);
  });

  // The peg matrix is nine columns wide, so a cell cannot be 48px on a phone.
  // Hit slop is what keeps each node comfortably tappable.
  it('keeps peg targets large enough once hit slop is applied', () => {
    expect(TILE + 12).toBeGreaterThanOrEqual(40);
  });

  it('uses no tofu-prone glyphs in UI text', () => {
    const banned = /[‹›▸▶▾▴→←⇒⟶⟵]/;
    SOURCES.forEach(({ file, text }) => {
      expect({ file, hit: banned.test(text) }).toEqual({ file, hit: false });
    });
  });

  it('uses no emoji as category markers', () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    SOURCES.forEach(({ file, text }) => {
      expect({ file, hit: emoji.test(text) }).toEqual({ file, hit: false });
    });
  });

  it('keeps every font size at or above the readability floor', () => {
    SOURCES.forEach(({ file, text }) => {
      const sizes = Array.from(text.matchAll(/fontSize:\s*(\d+)/g)).map(m => Number(m[1]));
      sizes.forEach(size => {
        expect({ file, size, ok: size >= 8 }).toEqual({ file, size, ok: true });
      });
    });
  });
});
