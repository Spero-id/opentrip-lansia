import { useSyncExternalStore } from "react";
import {
  DEFAULT_REDIRECT,
  readRedirectFromSearch,
  type RedirectOptions,
} from "@/utils/redirect";

const emptySubscribe = () => () => {};

export function useAuthRedirect(options?: RedirectOptions): string {
  const allowAdmin = options?.allowAdmin;
  return useSyncExternalStore(
    emptySubscribe,
    () => readRedirectFromSearch(window.location.search, { allowAdmin }),
    () => DEFAULT_REDIRECT
  );
}
