import "@testing-library/jest-dom";
import "whatwg-fetch";

import { TextEncoder, TextDecoder } from "util";
globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(() => ({ data: null, isPending: false })),
  signIn: { email: jest.fn() },
  signUp: { email: jest.fn() },
  signOut: jest.fn(),
  getSession: jest.fn(),
  authClient: {
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    useSession: jest.fn(() => ({ data: null, isPending: false })),
  },
}));

function makeThenable(result: any = []) {
  const thenFn = (resolve: (v: any) => void) => {
    resolve(result);
  };
  const obj: any = {
    limit: jest.fn(() => Promise.resolve(result)),
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve(result)),
    })),
    offset: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve(result)),
    })),
    then: thenFn,
    catch: (fn: any) => Promise.resolve(result).catch(fn),
    finally: (fn: any) => Promise.resolve(result).finally(fn),
  };
  return obj;
}

function makeSelectChain(result: any = []) {
  const queryResult = makeThenable(result);
  const whereResult = {
    ...queryResult,
    orderBy: jest.fn(() => makeThenable(result)),
    leftJoin: jest.fn(() => ({
      where: jest.fn(() => queryResult),
      orderBy: jest.fn(() => queryResult),
    })),
  };
  return {
    from: jest.fn(() => ({
      where: jest.fn(() => whereResult),
      orderBy: jest.fn(() => queryResult),
      limit: jest.fn(() => Promise.resolve(result)),
      leftJoin: jest.fn(() => ({
        where: jest.fn(() => queryResult),
        orderBy: jest.fn(() => queryResult),
      })),
    })),
    orderBy: jest.fn(() => queryResult),
  };
}

jest.mock("@/shared/db", () => {
  const mockDb = {
    select: jest.fn(() => makeSelectChain()),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([])),
        onConflictDoNothing: jest.fn(() => Promise.resolve()),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve()),
    })),
    transaction: jest.fn((fn: any) => fn()),
  };
  return { db: mockDb };
});

jest.mock("@/modules/auth/auth.config", () => ({
  auth: {
    api: {
      getSession: jest.fn(() => Promise.resolve(null)),
      signInEmail: jest.fn(() => Promise.resolve({ user: { id: "1", email: "test@test.com" } })),
      signUpEmail: jest.fn(() => Promise.resolve({ user: { id: "1", email: "test@test.com", name: "Test" } })),
      signOut: jest.fn(() => Promise.resolve({ success: true })),
    },
    handler: jest.fn(),
  },
}));

jest.mock("lucide-react", () => {
  const React = require("react");
  const cache: Record<string, React.FC> = {};
  const handler: ProxyHandler<Record<string, React.FC>> = {
    get(_, name: string) {
      if (name === "__esModule") return true;
      if (name === "default") return undefined;
      if (name === "createLucideIcon") return () => null;
      if (cache[name]) return cache[name];
      cache[name] = () => React.createElement("svg", { "data-testid": `lucide-${name}` }, React.createElement("text", null, name));
      return cache[name];
    },
  };
  return new Proxy({}, handler);
});


