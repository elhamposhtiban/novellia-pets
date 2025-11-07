import { z } from "zod";

export const createPetSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  animal_type: z
    .string()
    .min(1, "Animal type is required")
    .max(100, "Animal type is too long"),
  owner_name: z
    .string()
    .min(1, "Owner name is required")
    .max(255, "Owner name is too long"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
});

export type CreatePetFormData = z.infer<typeof createPetSchema>;

