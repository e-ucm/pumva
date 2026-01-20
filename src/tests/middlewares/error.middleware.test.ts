import { Request, Response, NextFunction } from "express";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { logger } from "@/lib/logger";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Unit tests for error middleware handling.
 */
describe("Error Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it("should handle 'User not found' error with 404 status", () => {
    const error = new NotFoundError("User not found");

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User not found"
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should handle any NotFoundError with 404 status", () => {
    const error = new NotFoundError("Tracker not found");

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Tracker not found"
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should handle generic errors with 500 status", () => {
    const error = new Error("Something went wrong");

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error"
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should handle errors without message with 500 status", () => {
    const error = { someProperty: "value" };

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error"
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should handle database errors with 500 status", () => {
    const error = new Error("Database connection failed");

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error"
    });
  });

  it("should handle validation errors with 500 status", () => {
    const error = new Error("Validation failed: email is required");

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error"
    });
  });
});
