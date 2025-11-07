import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { Pet, UpdatePetData } from "../types";
import { createPetSchema, CreatePetFormData } from "../schemas/petSchema";
import Loading from "../components/Loading";
import Error from "../components/Error";
import NavLink from "../components/NavLink";
import FormField from "../components/FormField";
import FormButtons from "../components/FormButtons";
import {
  validateFormData,
  extractValidationErrors,
  getErrorMessage,
} from "../utils/validation";

function EditPet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const petId = id ? parseInt(id, 10) : 0;

  const [formData, setFormData] = useState<CreatePetFormData>({
    name: "",
    animal_type: "",
    owner_name: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePetFormData, string>>
  >({});

  const {
    data: pet,
    isLoading,
    error,
  } = useQuery<Pet>({
    queryKey: ["pet", petId],
    queryFn: async () => {
      const response = await petService.getById(petId);
      return response.data;
    },
    enabled: !!petId,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdatePetData) => petService.update(petId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pet", petId] });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.refetchQueries({ queryKey: ["pet", petId] });
      navigate(`/pets/${petId}`);
    },
    onError: (error: any) => {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        setErrors({
          name: getErrorMessage(error, "Failed to update pet"),
        });
      }
    },
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        animal_type: pet.animal_type,
        owner_name: pet.owner_name,
        date_of_birth: pet.date_of_birth.split("T")[0], // Format date for input
      });
    }
  }, [pet]);

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
    e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) {
      e.preventDefault();
    }
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

  if (isLoading) {
    return <Loading message="Loading pet details..." />;
  }

  if (error || !pet) {
    return <Error message="Error loading pet details" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <NavLink to={`/pets/${petId}`} variant="text" className="mb-6">
          ← Back to Pet Details
        </NavLink>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Pet</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Pet Name" error={errors.name} required>
              <input
                type="text"
                id="name"
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
                id="animal_type"
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
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleChange("owner_name", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.owner_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter owner name"
              />
            </FormField>

            <FormField
              label="Date of Birth"
              error={errors.date_of_birth}
              required
            >
              <input
                type="date"
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date_of_birth ? "border-red-500" : "border-gray-300"
                }`}
              />
            </FormField>

            <FormButtons
              onCancel={() => navigate(`/pets/${petId}`)}
              onSubmit={(e) => handleSubmit(e)}
              isSubmitting={mutation.isPending}
              submitLabel="Update Pet"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPet;
