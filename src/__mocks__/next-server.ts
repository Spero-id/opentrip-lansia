const createMockResponse = (body?: unknown, init?: ResponseInit) => {
  const text = body ? JSON.stringify(body) : "";
  return {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "OK",
    headers: new Map(),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(text),
  };
};

export class NextRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  private _body: string | null;

  constructor(input: string | URL, init?: RequestInit) {
    this.url = typeof input === "string" ? input : input.toString();
    this.method = init?.method ?? "GET";
    this.headers = new Headers(init?.headers);
    this._body = typeof init?.body === "string" ? init.body : null;
  }

  async json() {
    return this._body ? JSON.parse(this._body) : {};
  }

  clone() {
    return new NextRequest(this.url, { method: this.method, headers: this.headers, body: this._body ?? undefined });
  }
}

export const NextResponse = {
  json: (body: unknown, init?: ResponseInit) => createMockResponse(body, init),
  redirect: (url: string | URL) => ({
    status: 302,
    headers: new Map([["Location", url.toString()]]),
  }),
  next: () => ({ status: 200 }),
};

export const userAgent = jest.fn(() => ({
  device: { type: "desktop" },
  browser: { name: "Chrome" },
  os: { name: "Mac" },
}));

export const cookies = jest.fn(() => ({
  get: jest.fn(),
  getAll: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}));

export const headers = jest.fn(() => new Headers());
