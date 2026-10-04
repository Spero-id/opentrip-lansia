export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;
const CODE_LIMIT = 256 - (256 % CODE_ALPHABET.length);

export function generateCode(prefix: string): string {
  const bytes = new Uint8Array(CODE_LENGTH * 2);
  globalThis.crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    if (byte >= CODE_LIMIT) continue;
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    if (code.length === CODE_LENGTH) break;
  }
  return `${prefix}-${code}`;
}