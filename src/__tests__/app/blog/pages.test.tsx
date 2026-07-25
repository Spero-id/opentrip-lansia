import { render, screen } from "@testing-library/react";
import BlogList from "@/app/blog/page";
import BlogDetail from "@/app/blog/[slug]/page";
import { makeBlog } from "../../helpers";

const mockDb = jest.requireMock("@/shared/db").db;

describe("Blog List Page", () => {
  beforeEach(() => {
    mockDb.select.mockClear();
  });

  it("renders blog list title", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    });
    render(await BlogList());
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("shows empty message when no blogs", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    });
    render(await BlogList());
    expect(screen.getByText("Belum ada artikel.")).toBeInTheDocument();
  });

  it("renders blog cards", async () => {
    const blog = makeBlog({ title: "Test Article", excerpt: "Article excerpt" });
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([blog])),
          })),
        })),
      })),
    });
    render(await BlogList());
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("Article excerpt")).toBeInTheDocument();
  });
});

describe("Blog Detail Page", () => {
  beforeEach(() => {
    mockDb.select.mockClear();
  });

  it("renders blog content", async () => {
    const blog = makeBlog({ title: "Detail Article", content: "Article content here" });
    mockDb.select.mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([blog])),
        })),
      })),
    });
    render(await BlogDetail({ params: Promise.resolve({ slug: "test-blog" }) }));
    expect(screen.getByText("Detail Article")).toBeInTheDocument();
    expect(screen.getByText("Article content here")).toBeInTheDocument();
  });
});
