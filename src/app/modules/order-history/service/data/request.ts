export class OrderHistoryRequest {
    orderId: number
    status: string
}

export interface FilterFieldRequest {
    field: string;
    value: string | number | boolean | Date | Array<string | number | boolean | Date>;
    condition?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'between' | 'in' | 'nin';
}
export interface SortFieldRequest {
    field: string;
    order: 'asc' | 'desc';
}
export interface FilterRequest {
    filters?: FilterFieldRequest[];
    sorts?: SortFieldRequest[];
    groupBy?: string[];
    page?: number;
    size?: number;
    limit?: number;
    fields?: string[];
}
