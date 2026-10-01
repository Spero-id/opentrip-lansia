import { auth } from "./auth.config";
import { toNextJsHandler } from "better-auth/next-js";
import { rehashLegacyPasswordOnSignIn } from "./auth.service";

const { GET, POST: rawPost } = toNextJsHandler(auth.handler ?? auth);

async function POST(request: Request) {
  const response = await rawPost(request);

  if (response.ok && new URL(request.url).pathname.endsWith("/sign-in/email")) {
    const { email, password } = (await request.clone().json()) as { email?: string; password?: string };
    if (email && password) {
      await rehashLegacyPasswordOnSignIn(email, password);
    }
  }

  return response;
}

export { GET, POST };
