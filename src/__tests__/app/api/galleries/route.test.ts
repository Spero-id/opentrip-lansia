import { GET } from "@/app/api/galleries/route";
import { db } from "@/db";

const mockDb = jest.mocked(db);

describe("GET /api/galleries", () => {
  it("returns galleries list", async () => {
    const galleries = [{ id: "g1", title: "Gallery A" }];
    const chain = {
      from: jest.fn(() => ({
        orderBy: jest.fn(() => Promise.resolve(galleries)),
      })),
    };
    (mockDb.select as jest.Mock).mockReturnValue(chain);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(galleries);
  });
});
