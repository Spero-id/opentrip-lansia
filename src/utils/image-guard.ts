export type ImageKind = "jpeg" | "png" | "webp" | "gif" | "avif";

const MAGIC: Record<ImageKind, { match: (buf: Buffer) => boolean }> = {
  jpeg: { match: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  png: {
    match: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  gif: { match: (b) => b.length >= 4 && b.toString("latin1", 0, 4) === "GIF8" },
  webp: {
    match: (b) =>
      b.length >= 12 &&
      b.toString("latin1", 0, 4) === "RIFF" &&
      b.toString("latin1", 8, 12) === "WEBP",
  },
  avif: {
    match: (b) =>
      b.length >= 12 &&
      b.toString("latin1", 4, 8) === "ftyp" &&
      /avif|avis/.test(b.toString("latin1", 8, 12)),
  },
};

const EXT_BY_KIND: Record<ImageKind, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  gif: ".gif",
  avif: ".avif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(MAGIC) as ImageKind[];

export function detectImageKind(buf: Buffer): ImageKind | null {
  if (buf.length < 12) return null;
  for (const kind of ALLOWED_IMAGE_TYPES) {
    if (MAGIC[kind].match(buf)) return kind;
  }
  return null;
}

export function isAllowedImage(buf: Buffer): boolean {
  return detectImageKind(buf) !== null;
}

export function extensionForImage(buf: Buffer): string {
  const kind = detectImageKind(buf);
  return kind ? EXT_BY_KIND[kind] : "";
}
