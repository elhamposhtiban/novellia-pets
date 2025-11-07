import { z } from "zod";

export const createRecordSchema = z
  .object({
    record_type: z.enum(["vaccine", "allergy"], {
      errorMap: () => ({ message: 'Record type must be "vaccine" or "allergy"' }),
    }),
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name is too long"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
      .optional(),
    reactions: z.string().optional(),
    severity: z.enum(["mild", "severe"]).optional(),
  })
  .refine(
    (data) => {
      if (data.record_type === "vaccine" && !data.date) {
        return false;
      }
      return true;
    },
    {
      message: "Vaccine records require a date",
      path: ["date"],
    }
  )
  .refine(
    (data) => {
      if (data.record_type === "allergy" && !data.severity) {
        return false;
      }
      return true;
    },
    {
      message: "Allergy records require severity (mild or severe)",
      path: ["severity"],
    }
  );

export type CreateRecordFormData = z.infer<typeof createRecordSchema>;

