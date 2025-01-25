export enum ErrorType {
  // Application Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // Mantle Errors
  Mantle_TRANSACTION_ERROR = "Mantle_TRANSACTION_ERROR",
  Mantle_RPC_ERROR = "Mantle_RPC_ERROR",

  // Agent Errors
  AGENT_EXECUTION_ERROR = "AGENT_EXECUTION_ERROR",
  AGENT_INITIALIZATION_ERROR = "AGENT_INITIALIZATION_ERROR",
}

export interface ErrorMetadata {
  [key: string]: unknown;
}

export interface ErrorResponse {
  type: ErrorType;
  message: string;
  metadata?: ErrorMetadata;
}
