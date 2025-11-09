import { useState, FormEvent } from "react";
import { z } from "zod";
import Modal from "./Modal";
import FormField from "./FormField";
import FormButtons from "./FormButtons";
import {
  validateFormData,
  extractValidationErrors,
  getErrorMessage,
} from "../utils/validation";
import { useCreatePet } from "../hooks/usePetMutations";

const createPetSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
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

type CreatePetFormData = z.infer<typeof createPetSchema>;

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PetFormModal({ isOpen, onClose }: PetFormModalProps) {
  const [formData, setFormData] = useState<CreatePetFormData>({
    name: "",
    animal_type: "",
    owner_name: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePetFormData, string>>
  >({});

  const mutation = useCreatePet();

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
    const { isValid, errors: validationErrors } = validateFormData(
      createPetSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (
    e?: FormEvent | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) {
      e.preventDefault();
    }
    if (validateForm()) {
      mutation.mutate(formData, {
        onSuccess: () => {
          handleClose();
        },
        onError: (error: any) => {
          const validationErrors = extractValidationErrors(error);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
          } else {
            setErrors({
              name: getErrorMessage(error, "Failed to create pet"),
            });
          }
        },
      });
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Pet">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Pet Name" error={errors.name} required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter pet name"
          />
        </FormField>

        <FormField label="Animal Type" error={errors.animal_type} required>
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
        </FormField>

        <FormField label="Owner Name" error={errors.owner_name} required>
          <input
            type="text"
            value={formData.owner_name}
            onChange={(e) => handleChange("owner_name", e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.owner_name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter owner name"
          />
        </FormField>

        <FormField label="Date of Birth" error={errors.date_of_birth} required>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date_of_birth ? "border-red-500" : "border-gray-300"
            }`}
          />
        </FormField>

        <FormButtons
          onCancel={handleClose}
          onSubmit={(e) => handleSubmit(e)}
          isSubmitting={mutation.isPending}
          submitLabel="Add Pet"
        />
      </form>
    </Modal>
  );
}

export default PetFormModal;
