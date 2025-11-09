import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { MedicalRecord } from "../types";
import {
  validateFormData,
  extractValidationErrors,
  getErrorMessage,
} from "../utils/validation";
import { useCreateRecord, useUpdateRecord } from "./useRecordMutations";

const createRecordSchema = z
  .object({
    record_type: z.enum(["vaccine", "allergy"], {
      errorMap: () => ({
        message: 'Record type must be "vaccine" or "allergy"',
      }),
    }),
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
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

export function useRecordForm(
  petId: number,
  record: MedicalRecord | null | undefined,
  isOpen: boolean,
  onClose: () => void
) {
  const isEditing = !!record;
  const [formData, setFormData] = useState<CreateRecordFormData>({
    record_type: "vaccine",
    name: "",
    date: "",
    reactions: "",
    severity: undefined,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateRecordFormData, string>>
  >({});

  const createMutation = useCreateRecord(petId);
  const updateMutation = useUpdateRecord(petId);

  useEffect(() => {
    if (record) {
      let formattedDate = "";
      if (record.date) {
        const dateObj = new Date(record.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split("T")[0];
        }
      }

      setFormData({
        record_type: record.record_type,
        name: record.name,
        date: formattedDate,
        reactions: record.reactions || "",
        severity: record.severity || undefined,
      });
    } else {
      setFormData({
        record_type: "vaccine",
        name: "",
        date: "",
        reactions: "",
        severity: undefined,
      });
    }
    setErrors({});
  }, [record, isOpen]);

  const handleClose = useCallback(() => {
    setFormData({
      record_type: "vaccine",
      name: "",
      date: "",
      reactions: "",
      severity: undefined,
    });
    setErrors({});
    onClose();
  }, [onClose]);

  const validateForm = useCallback((): boolean => {
    const cleanedFormData = {
      ...formData,
      severity: formData.severity === null ? undefined : formData.severity,
    };

    const { isValid, errors: validationErrors } = validateFormData(
      createRecordSchema,
      cleanedFormData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      if (isEditing && record) {
        const updateData = {
          recordId: record.id,
          record_type: formData.record_type,
          name: formData.name,
          date: formData.date || undefined,
          reactions: formData.reactions || undefined,
          severity: formData.severity === null ? undefined : formData.severity,
        };
        updateMutation.mutate(updateData, {
          onSuccess: () => {
            handleClose();
          },
          onError: (error: any) => {
            const validationErrors = extractValidationErrors(error);
            if (Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
            } else {
              setErrors({
                name: getErrorMessage(error, "Failed to update record"),
              });
            }
          },
        });
      } else {
        createMutation.mutate(formData, {
          onSuccess: () => {
            handleClose();
          },
          onError: (error: any) => {
            const validationErrors = extractValidationErrors(error);
            if (Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
            } else {
              setErrors({
                name: getErrorMessage(error, "Failed to create record"),
              });
            }
          },
        });
      }
    },
    [
      isEditing,
      record,
      formData,
      validateForm,
      updateMutation,
      createMutation,
      handleClose,
    ]
  );

  const handleChange = useCallback(
    (field: keyof CreateRecordFormData, value: string | undefined) => {
      setFormData((prev: CreateRecordFormData) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => {
        if (prev[field]) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleRecordTypeChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      record_type: value as "vaccine" | "allergy",
      date: value === "vaccine" ? prev.date : "",
      severity: value === "allergy" ? prev.severity : undefined,
    }));
    setErrors({});
  }, []);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return {
    formData,
    errors,
    isPending,
    handleClose,
    handleSubmit,
    handleChange,
    handleRecordTypeChange,
  };
}

