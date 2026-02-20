import { z, type ZodTypeAny } from "zod";
import { HttpError } from "./http-error.js";

export const parseWithSchema = <T extends ZodTypeAny>(
  schema: T,
  value: unknown
): z.infer<T> => {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new HttpError(422, "Validation error", error);
  }
};
