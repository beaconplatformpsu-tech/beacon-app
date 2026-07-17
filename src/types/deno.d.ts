declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export interface Request {
    method: string;
    headers: Headers;
    json(): Promise<unknown>;
  }

  export interface ResponseInit {
    headers?: HeadersInit | Record<string, string>;
    status?: number;
  }

  export class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
  }

  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}
