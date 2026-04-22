import {
  fetchManifest,
  findPack,
  type PackManifest,
} from "../../../../services/packs/manifest";

const manifest: PackManifest = {
  generatedAt: "2026-04-20T00:00:00Z",
  packs: [
    {
      lang: "it",
      version: 2,
      name: "Italiano",
      url: "https://example.test/it-v2.zip",
      sizeBytes: 1024 * 1024 * 5,
    },
    {
      lang: "it",
      version: 3,
      name: "Italiano",
      url: "https://example.test/it-v3.zip",
      sizeBytes: 1024 * 1024 * 6,
    },
    {
      lang: "de",
      version: 1,
      name: "Deutsch",
      url: "https://example.test/de-v1.zip",
    },
  ],
};

describe("findPack", () => {
  it("returns the highest-version entry for a language", () => {
    const pack = findPack(manifest, "it");
    expect(pack?.version).toBe(3);
  });

  it("returns the only entry when a single version exists", () => {
    const pack = findPack(manifest, "de");
    expect(pack?.version).toBe(1);
  });

  it("returns null for an unknown language", () => {
    expect(findPack(manifest, "fr")).toBeNull();
  });
});

describe("fetchManifest", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch;
  });

  it("parses a well-formed manifest", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => manifest,
    }) as any;
    const result = await fetchManifest("https://example.test/manifest.json");
    expect(result.packs).toHaveLength(3);
  });

  it("throws when the response is not OK", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    }) as any;
    await expect(
      fetchManifest("https://example.test/missing.json"),
    ).rejects.toThrow(/Manifest fetch failed: 404/);
  });

  it("throws when the body is not a manifest shape", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ something: "else" }),
    }) as any;
    await expect(
      fetchManifest("https://example.test/bad.json"),
    ).rejects.toThrow(/Invalid manifest/);
  });
});
