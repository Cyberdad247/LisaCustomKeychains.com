/**
 * 🧠 A2UI DESIGN MEMORY
 *
 * Lightweight localStorage persistence so customers can save, revisit, and
 * reorder their custom designs — the storefront translation of "Ouroboros
 * memory" (FirnFlow-style tiered recall, without the mythology).
 *
 * @module @/lib/a2ui/memory
 */

export interface SavedDesign {
  id: string;
  name: string;
  savedAt: string;
  design: {
    text: string;
    colorId: string;
    colorName: string;
    charmIds: string[];
    tier: number;
  };
}

const STORAGE_KEY = "lck.a2ui.designs.v1";
const MAX_DESIGNS = 12;

function readAll(): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is SavedDesign =>
        Boolean(d) &&
        typeof d === "object" &&
        typeof (d as SavedDesign).id === "string" &&
        typeof (d as SavedDesign).name === "string" &&
        typeof (d as SavedDesign).savedAt === "string" &&
        typeof (d as SavedDesign).design === "object"
    );
  } catch {
    return [];
  }
}

function writeAll(designs: SavedDesign[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch {
    // Storage full / unavailable — fail silently; memory is best-effort.
  }
}

export function saveDesign(input: {
  name: string;
  text: string;
  colorId: string;
  colorName: string;
  charmIds: string[];
  tier: number;
}): SavedDesign {
  const designs = readAll();
  const entry: SavedDesign = {
    id: `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim().slice(0, 40) || "Untitled design",
    savedAt: new Date().toISOString(),
    design: {
      text: input.text,
      colorId: input.colorId,
      colorName: input.colorName,
      charmIds: input.charmIds,
      tier: input.tier,
    },
  };
  writeAll([entry, ...designs].slice(0, MAX_DESIGNS));
  return entry;
}

export function listDesigns(): SavedDesign[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function deleteDesign(id: string): SavedDesign[] {
  const next = readAll().filter((d) => d.id !== id);
  writeAll(next);
  return next;
}

export function clearDesigns(): void {
  writeAll([]);
}

/** Rehydrates a saved design's color name back into the registry if possible. */
export function findColorByName(name: string): string | undefined {
  if (!name) return undefined;
  return name; // stored display name is used as fallback; consumers match by id
}
