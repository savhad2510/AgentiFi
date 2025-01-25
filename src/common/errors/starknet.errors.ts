import { BaseError } from "./base.error";
import { ErrorType, ErrorMetadata } from "./error.types";

export class MantleTransactionError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorType.MANTLE_TRANSACTION_ERROR, message, metadata);
  }
}

export class MantleRpcError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorType.MANTLE_RPC_ERROR, message, metadata);
  }
}
