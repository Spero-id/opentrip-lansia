import crypto from "crypto";
import bcrypt from "bcryptjs";

const LEGACY_SHA256 = /^[0-9a-f]{64}$/;
const BCRYPT_COST = 10;

export function isLegacySha256(hash: string) {
  return LEGACY_SHA256.test(hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string) {
  if (isLegacySha256(hash)) {
    return crypto.createHash("sha256").update(password).digest("hex") === hash;
  }
  return bcrypt.compare(password, hash);
}
