import { apiRequest } from './api';
import { Exercise, ExerciseFilters, ExercisesResponse } from '../types';

export interface ExerciseCategory {
  value: string;
  label: string;
}

export interface ExerciseMetadata {
  categories: ExerciseCategory[];
  muscles: ExerciseCategory[];
  equipment: ExerciseCategory[];
  difficulties: ExerciseCategory[];
  types: ExerciseCategory[];
}

// Lấy danh sách bài tập với bộ lọc
export const getExercises = async (
  filters: ExerciseFilters = {},
  page = 1,
  limit = 20
): Promise<ExercisesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.category && { category: filters.category }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    ...(filters.type && { type: filters.type }),
    ...(filters.equipment && { equipment: filters.equipment.join(',') }),
    ...(filters.muscles && { muscles: filters.muscles.join(',') }),
    ...(filters.search && { search: filters.search }),
    ...(filters.sort && { sort: filters.sort })
  });

  return apiRequest.get<ExercisesResponse>(`/exercises?${params.toString()}`);
};

// Lấy chi tiết bài tập
export const getExerciseById = async (id: string): Promise<{ exercise: Exercise }> => {
  return apiRequest.get<{ exercise: Exercise }>(`/exercises/${id}`);
};

// Lấy metadata cho bộ lọc
export const getExerciseMetadata = async (): Promise<ExerciseMetadata> => {
  return apiRequest.get<ExerciseMetadata>('/exercises/categories/list');
};

// Đánh giá bài tập
export const rateExercise = async (
  id: string,
  rating: number
): Promise<{ message: string; averageRating: number; ratingCount: number }> => {
  return apiRequest.post<{ message: string; averageRating: number; ratingCount: number }>(
    `/exercises/${id}/rate`,
    { rating }
  );
};

// Tìm kiếm bài tập
export const searchExercises = async (
  query: string,
  filters: Partial<ExerciseFilters> = {}
): Promise<ExercisesResponse> => {
  return getExercises({ ...filters, search: query });
};
