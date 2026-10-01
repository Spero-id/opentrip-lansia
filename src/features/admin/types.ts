export type AdminRowId = string | number;

export interface AdminTableOptions<T> {
  searchKeys: Array<keyof T>;
  statusKey?: keyof T;
  allStatusValue?: string;
  pageSize?: number;
}

export const ADMIN_ALL_STATUS = "all";
export const ADMIN_DEFAULT_PAGE_SIZE = 10;
