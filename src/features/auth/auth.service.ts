import { auth } from "./auth.config";
import { authRepository } from "./auth.repository";
import { auditService, diffFields, pickFields } from "@/features/audit";
import { hashPassword, isLegacySha256 } from "@/utils/password";

/** User fields allowed in audit — email is deliberately excluded (PII). */
const USER_AUDIT_FIELDS = ["name", "role", "phone", "emailVerified"] as const;

async function rehashLegacyPassword(email: string, password: string) {
  const user = await authRepository.findByEmail(email);
  if (!user) return;
  const stored = await authRepository.getAccountPassword(user.id);
  if (stored && isLegacySha256(stored)) {
    await authRepository.updateAccountPassword(user.id, await hashPassword(password));
  }
}

export async function rehashLegacyPasswordOnSignIn(email: string, password: string) {
  await rehashLegacyPassword(email, password);
}

export const authService = {
  config: auth,

  async getSession(headers: Headers) {
    return auth.api.getSession({ headers });
  },

  async signIn(email: string, password: string, headers: Headers) {
    const result = await auth.api.signInEmail({ body: { email, password }, headers });
    if (result?.user) {
      await rehashLegacyPassword(email, password);
    }
    return result;
  },

  async signUp(email: string, password: string, name: string, headers: Headers) {
    return auth.api.signUpEmail({ body: { email, password, name }, headers });
  },

  async signOut(headers: Headers) {
    return auth.api.signOut({ headers });
  },

  async getUser(id: string) {
    return authRepository.findById(id);
  },

  async getAllUsers() {
    return authRepository.findAll();
  },

  async updateUser(id: string, data: Parameters<typeof authRepository.update>[1], adminId?: string | null) {
    const before = await authRepository.findById(id);
    await authRepository.update(id, data);
    const after = await authRepository.findById(id);
    const changes = diffFields(before, after, USER_AUDIT_FIELDS);
    if (Object.keys(changes).length > 0) {
      await auditService.record({
        adminId: adminId ?? null,
        action: "update",
        entityType: "user",
        entityId: id,
        oldValues: pickFields(before, USER_AUDIT_FIELDS),
        newValues: changes,
        description: `Profil user "${before?.name ?? id}" diperbarui admin`,
      });
    }
  },

  async deleteUser(id: string, adminId?: string | null) {
    const before = await authRepository.findById(id);
    await authRepository.delete(id);
    await auditService.record({
      adminId: adminId ?? null,
      action: "delete",
      entityType: "user",
      entityId: id,
      oldValues: pickFields(before, USER_AUDIT_FIELDS),
      newValues: null,
      description: `User "${before?.name ?? id}" dihapus admin`,
    });
  },
};
