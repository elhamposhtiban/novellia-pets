import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { CreatePetData } from "../types";
import { createPetSchema, CreatePetFormData } from "../schemas/petSchema";

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PetFormModal({ isOpen, onClose }: PetFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreatePetFormData>({
    name: "",
    animal_type: "",
    owner_name: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePetFormData, string>>
  >({});

  const mutation = useMutation({
    mutationFn: petService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.details) {
        const validationErrors: Partial<
          Record<keyof CreatePetFormData, string>
        > = {};
        error.response.data.details.forEach((err: any) => {
          if (err.path && err.path[0]) {
            validationErrors[err.path[0] as keyof CreatePetFormData] =
              err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          name: error.response?.data?.error || "Failed to create pet",
        });
      }
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      animal_type: "",
      owner_name: "",
      date_of_birth: "",
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const result = createPetSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof CreatePetFormData, string>> = {};
      result.error.errors.forEach(
        (err: { path: (string | number)[]; message: string }) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CreatePetFormData] = err.message;
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
      mutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreatePetFormData, value: string) => {
    setFormData((prev: CreatePetFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof CreatePetFormData, string>>) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[100vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Add New Pet</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter pet name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Type *
              </label>
              <select
                value={formData.animal_type}
                onChange={(e) => handleChange("animal_type", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.animal_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select animal type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="other">Other</option>
              </select>
              {errors.animal_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.animal_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => handleChange("owner_name", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.owner_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter owner name"
              />
              {errors.owner_name && (
                <p className="text-red-500 text-sm mt-1">{errors.owner_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date_of_birth ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Adding..." : "Add Pet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PetFormModal;
