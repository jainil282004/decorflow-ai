export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const calculatePagination = (total: number, limit: number) => {
  return {
    totalPages: Math.ceil(total / limit),
  };
};
