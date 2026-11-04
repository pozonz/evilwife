import 'jquery';

declare global {
    interface JQuery {
        chosen(options?: Record<string, unknown> | string): JQuery;
        sortable(options?: Record<string, unknown>): JQuery;
        sortable(method: string, ...args: unknown[]): unknown;
    }
}

declare module '*.less';
