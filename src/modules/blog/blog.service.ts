import { blogRepository } from "./blog.repository";

export const blogService = {
  async getPublishedBlogs() {
    return blogRepository.findAllPublished();
  },

  async getBlogBySlug(slug: string) {
    return blogRepository.findBySlug(slug);
  },
};
