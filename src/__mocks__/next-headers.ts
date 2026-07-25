export function headers() {
  return new Headers();
}

export function cookies() {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
}

export const draftMode = jest.fn(() => ({ isEnabled: false }));
