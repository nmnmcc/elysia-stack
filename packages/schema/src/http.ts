import { t, type Static } from "elysia";

export const ErrorResponse = t.Object({
  message: t.String(),
});

export type ErrorResponse = Static<typeof ErrorResponse>;
