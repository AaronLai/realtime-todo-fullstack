// backend/libs/shared/src/utils/response.ts

export class Response<T = any> {
    status: number;
    error: string | null;
    data: T | null;
  
    constructor(status: number, data: T | null = null, error: string | null = null) {
      this.status = status;
      this.data = data;
      this.error = error;
    }
  
    static success<T>(data: T, status: number = 200): Response<T> {
      return new Response(status, data);
    }
  
    static error(error: string, status: number = 400): Response<null> {
      return new Response(status, null, error);
    }
  
    static notFound(message: string = 'Not Found'): Response<null> {
      return new Response(404, null, message);
    }
  
    static badRequest(message: string = 'Bad Request'): Response<null> {
      return new Response(400, null, message);
    }
  
    static internalServerError(message: string = 'Internal Server Error'): Response<null> {
      return new Response(500, null, message);
    }
  }
  