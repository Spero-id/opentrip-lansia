import { reviewRepository } from "./review.repository";

export const reviewService = {
  async createReview(data: Parameters<typeof reviewRepository.create>[0]) {
    return reviewRepository.create(data);
  },
};
