export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Auto-assign code based on status code if not provided
    if (code) {
      this.code = code;
    } else {
      switch (statusCode) {
        case 400:
          this.code = 'BAD_REQUEST';
          break;
        case 401:
          this.code = 'UNAUTHORIZED';
          break;
        case 403:
          this.code = 'FORBIDDEN';
          break;
        case 404:
          this.code = 'NOT_FOUND';
          break;
        case 409:
          this.code = 'CONFLICT';
          break;
        default:
          this.code = 'INTERNAL_ERROR';
          break;
      }
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}
