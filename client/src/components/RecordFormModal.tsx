import { useState, FormEvent, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordService } from "../services/recordService";
import { CreateRecordData, MedicalRecord, UpdateRecordData } from "../types";
import {
  createRecordSchema,
  CreateRecordFormData,
} from "../schemas/recordSchema";

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
      setFormData({
        record_type: record.record_type,
        name: record.name,
        date: record.date || "",
        reactions: record.reactions || "",
        severity: record.severity,
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
      if (error.response?.data?.details) {
        const validationErrors: Partial<
          Record<keyof CreateRecordFormData, string>
        > = {};
        error.response.data.details.forEach((err: any) => {
          if (err.path && err.path[0]) {
            validationErrors[err.path[0] as keyof CreateRecordFormData] =
              err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          name: error.response?.data?.error || "Failed to create record",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRecordData) =>
      recordService.update(record!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.details) {
        const validationErrors: Partial<
          Record<keyof CreateRecordFormData, string>
        > = {};
        error.response.data.details.forEach((err: any) => {
          if (err.path && err.path[0]) {
            validationErrors[err.path[0] as keyof CreateRecordFormData] =
              err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          name: error.response?.data?.error || "Failed to update record",
        });
      }
    },
  });

  const handleClose = () => {
    setFormData({
      record_type: "vaccine",
      name: "",
      date: "",
      reactions: "",
      severity: undefined,
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const result = createRecordSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof CreateRecordFormData, string>> = {};
      result.error.errors.forEach(
        (err: { path: (string | number)[]; message: string }) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CreateRecordFormData] = err.message;
          }
        }
      );
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditing) {
        updateMutation.mutate(formData);
      } else {
        createMutation.mutate(formData);
      }
    }
  };

  const handleChange = (
    field: keyof CreateRecordFormData,
    value: string | undefined
  ) => {
    setFormData((prev: CreateRecordFormData) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(
        (prev: Partial<Record<keyof CreateRecordFormData, string>>) => ({
          ...prev,
          [field]: undefined,
        })
      );
    }
  };

  const handleRecordTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      record_type: value as "vaccine" | "allergy",
      date: value === "vaccine" ? prev.date : "",
      severity: value === "allergy" ? prev.severity : undefined,
    }));
    setErrors({});
  };

  const isVaccine = formData.record_type === "vaccine";
  const isAllergy = formData.record_type === "allergy";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[100vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {isEditing ? "Edit Medical Record" : "Add Medical Record"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type *
              </label>
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
              {errors.record_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.record_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
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
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {isVaccine && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Administered *
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
            )}

            {isAllergy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity *
                </label>
                <select
                  value={formData.severity || ""}
                  onChange={(e) =>
                    handleChange(
                      "severity",
                      e.target.value as "mild" | "severe"
                    )
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.severity ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select severity</option>
                  <option value="mild">Mild</option>
                  <option value="severe">Severe</option>
                </select>
                {errors.severity && (
                  <p className="text-red-500 text-sm mt-1">{errors.severity}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reactions (Optional)
              </label>
              <textarea
                value={formData.reactions || ""}
                onChange={(e) => handleChange("reactions", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe any reactions (e.g., hives, rash, swelling)"
              />
            </div>

            {isAllergy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update Record"
                  : "Add Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecordFormModal;
