import { useState, FormEvent, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { recordService } from "../services/recordService";
import { CreateRecordData, MedicalRecord, UpdateRecordData } from "../types";
import Modal from "./Modal";
import FormField from "./FormField";
import FormButtons from "./FormButtons";
import {
  validateFormData,
  extractValidationErrors,
  getErrorMessage,
} from "../utils/validation";

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

type CreateRecordFormData = z.infer<typeof createRecordSchema>;

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: number;
  record?: MedicalRecord | null;
}

function RecordFormModal({
  isOpen,
  onClose,
  petId,
  record,
}: RecordFormModalProps) {
  const queryClient = useQueryClient();
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

  const createMutation = useMutation({
    mutationFn: (data: CreateRecordData) => recordService.create(petId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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

  const updateMutation = useMutation({
    mutationFn: ({
      recordId,
      ...data
    }: UpdateRecordData & { recordId: number }) =>
      recordService.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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
    (e?: FormEvent | React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      if (isEditing && record) {
        const updateData: UpdateRecordData & { recordId: number } = {
          recordId: record.id,
          record_type: formData.record_type,
          name: formData.name,
          date: formData.date || undefined,
          reactions: formData.reactions || undefined,
          severity: formData.severity === null ? undefined : formData.severity,
        };
        updateMutation.mutate(updateData);
      } else {
        createMutation.mutate(formData);
      }
    },
    [isEditing, record, formData, validateForm, updateMutation, createMutation]
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

  const isVaccine = formData.record_type === "vaccine";
  const isAllergy = formData.record_type === "allergy";
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Medical Record" : "Add Medical Record"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Record Type" error={errors.record_type} required>
          <select
            value={formData.record_type}
            onChange={(e) => handleRecordTypeChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.record_type ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="vaccine">Vaccine</option>
            <option value="allergy">Allergy</option>
          </select>
        </FormField>

        <FormField
          label={isVaccine ? "Vaccine Name" : "Allergy Name"}
          error={errors.name}
          required
        >
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={
              isVaccine ? "Enter vaccine name" : "Enter allergy name"
            }
          />
        </FormField>

        {isVaccine && (
          <FormField label="Date Administered" error={errors.date} required>
            <input
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
          </FormField>
        )}

        {isAllergy && (
          <FormField label="Severity" error={errors.severity} required>
            <select
              value={formData.severity || ""}
              onChange={(e) =>
                handleChange("severity", e.target.value as "mild" | "severe")
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.severity ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select severity</option>
              <option value="mild">Mild</option>
              <option value="severe">Severe</option>
            </select>
          </FormField>
        )}

        <FormField label="Reactions (Optional)" error={errors.reactions}>
          <textarea
            value={formData.reactions || ""}
            onChange={(e) => handleChange("reactions", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe any reactions (e.g., hives, rash, swelling)"
          />
        </FormField>

        {isAllergy && (
          <FormField label="Date (Optional)" error={errors.date}>
            <input
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FormField>
        )}

        <FormButtons
          onCancel={handleClose}
          onSubmit={(e) => handleSubmit(e)}
          isSubmitting={isPending}
          submitLabel={isEditing ? "Update Record" : "Add Record"}
        />
      </form>
    </Modal>
  );
}

export default RecordFormModal;
