export declare const corsOptions: {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
};
export declare const devCorsOptions: {
    origin: boolean;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
};
export declare function getCorsOptions(): {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
} | {
    origin: boolean;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
};
export declare function handlePreflightRequest(request: any, reply: any): void;
export declare function securityHeaders(request: any, reply: any): void;
//# sourceMappingURL=cors.d.ts.map