// backend/libs/shared/src/utils/response.spec.ts

import { Response } from './response';

describe('Response', () => {
  describe('constructor', () => {
    it('should create a response with given status, data, and error', () => {
      const response = new Response(200, { id: 1 }, null);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ id: 1 });
      expect(response.error).toBeNull();
    });

    it('should create a response with default null values for data and error', () => {
      const response = new Response(404);
      expect(response.status).toBe(404);
      expect(response.data).toBeNull();
      expect(response.error).toBeNull();
    });
  });

  describe('success', () => {
    it('should create a success response with default status 200', () => {
      const response = Response.success({ message: 'Success' });
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ message: 'Success' });
      expect(response.error).toBeNull();
    });

    it('should create a success response with custom status', () => {
      const response = Response.success({ id: 1 }, 201);
      expect(response.status).toBe(201);
      expect(response.data).toEqual({ id: 1 });
      expect(response.error).toBeNull();
    });
  });

  describe('error', () => {
    it('should create an error response with default status 400', () => {
      const response = Response.error('Bad Request');
      expect(response.status).toBe(400);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Bad Request');
    });

    it('should create an error response with custom status', () => {
      const response = Response.error('Unauthorized', 401);
      expect(response.status).toBe(401);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Unauthorized');
    });
  });

  describe('notFound', () => {
    it('should create a not found response with default message', () => {
      const response = Response.notFound();
      expect(response.status).toBe(404);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Not Found');
    });

    it('should create a not found response with custom message', () => {
      const response = Response.notFound('User not found');
      expect(response.status).toBe(404);
      expect(response.data).toBeNull();
      expect(response.error).toBe('User not found');
    });
  });

  describe('badRequest', () => {
    it('should create a bad request response with default message', () => {
      const response = Response.badRequest();
      expect(response.status).toBe(400);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Bad Request');
    });

    it('should create a bad request response with custom message', () => {
      const response = Response.badRequest('Invalid input');
      expect(response.status).toBe(400);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Invalid input');
    });
  });

  describe('internalServerError', () => {
    it('should create an internal server error response with default message', () => {
      const response = Response.internalServerError();
      expect(response.status).toBe(500);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Internal Server Error');
    });

    it('should create an internal server error response with custom message', () => {
      const response = Response.internalServerError('Database connection failed');
      expect(response.status).toBe(500);
      expect(response.data).toBeNull(); expect(response.error).toBe('Database connection failed');
    });
  });
});
