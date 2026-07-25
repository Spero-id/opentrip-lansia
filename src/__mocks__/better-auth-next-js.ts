export function toNextJsHandler(handler: unknown) {
  return { GET: jest.fn(), POST: jest.fn() };
}
