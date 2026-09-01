import type { OpErrorBody, OpErrorCode } from "./types";

export class OpError extends Error {
  readonly code: OpErrorCode;
  readonly hint: string;

  constructor(code: OpErrorCode, hint: string) {
    super(hint);
    this.name = "OpError";
    this.code = code;
    this.hint = hint;
  }

  toBody(): OpErrorBody {
    return { ok: false, code: this.code, hint: this.hint };
  }
}

export function isOpError(err: unknown): err is OpError {
  return err instanceof OpError;
}
