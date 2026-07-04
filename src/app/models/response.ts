export interface RESTfulResponse<T> {
    code:number;
    data: T;
    message: string;
    timestamp: string;
}
