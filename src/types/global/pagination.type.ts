export type TPagination<T> = {
    data: T[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}