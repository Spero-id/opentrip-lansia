import { auth } from "./auth.config";
import { authRepository } from "./auth.repository";
import { hashPassword, isLegacySha256 } from "@/shared/utils/password";

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

  async updateUser(id: string, data: Parameters<typeof authRepository.update>[1]) {
    return authRepository.update(id, data);
  },

  async deleteUser(id: string) {
    return authRepository.delete(id);
  },
};
