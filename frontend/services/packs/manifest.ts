import logger from "../logger";

export interface PackManifestEntry {
  lang: string;
  version: number;
  name: string;
  url: string;
  sizeBytes?: number;
  sha256?: string;
  description?: string;
}

export interface PackManifest {
  generatedAt: string;
  packs: PackManifestEntry[];
}

/**
 * Where to find the pack manifest. Configurable via `EXPO_PUBLIC_PACK_MANIFEST_URL`
 * so dev builds can point at a local test host. Default target is GitHub Releases
 * (tag `packs-latest`) per the approved plan.
 */
export const MANIFEST_URL =
  process.env.EXPO_PUBLIC_PACK_MANIFEST_URL ??
  "https://github.com/novadrake/dudulingo/releases/download/packs-latest/manifest.json";

export async function fetchManifest(
  url: string = MANIFEST_URL,
): Promise<PackManifest> {
  logger.debug(`Fetching pack manifest from ${url}`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Manifest fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as PackManifest;
  if (!data || !Array.isArray(data.packs)) {
    throw new Error("Invalid manifest: missing `packs` array");
  }
  return data;
}

/**
 * Find the entry for a given language. Returns the highest-version entry if
 * multiple are listed (builder should only emit one, but defense in depth).
 */
export function findPack(
  manifest: PackManifest,
  lang: string,
): PackManifestEntry | null {
  const matches = manifest.packs.filter((p) => p.lang === lang);
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.version >= b.version ? a : b));
}
