import { auth } from "./auth.config";
import { authRepository } from "./auth.repository";

export const authService = {
  config: auth,

  async getSession(headers: Headers) {
    return auth.api.getSession({ headers });
  },

  async signIn(email: string, password: string, headers: Headers) {
    return auth.api.signInEmail({ body: { email, password }, headers });
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
};
