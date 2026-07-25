import { reviewRepository } from "./review.repository";
import type { UUID } from "@/shared/types";

export const reviewService = {
  async createReview(data: Parameters<typeof reviewRepository.create>[0]) {
    return reviewRepository.create(data);
  },
};
