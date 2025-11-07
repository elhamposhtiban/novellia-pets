import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { recordService } from "../services/recordService";
import { Pet, MedicalRecord } from "../types";
import Loading from "../components/Loading";
import Error from "../components/Error";
import NavLink from "../components/NavLink";
import MedicalRecordCard from "../components/MedicalRecordCard";

function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petId = id ? parseInt(id, 10) : 0;

  const {
    data: pet,
    isLoading: petLoading,
    error: petError,
  } = useQuery<Pet>({
    queryKey: ["pet", petId],
    queryFn: async () => {
      const response = await petService.getById(petId);
      return response.data;
    },
    enabled: !!petId,
  });

  const {
    data: records,
    isLoading: recordsLoading,
    error: recordsError,
  } = useQuery<MedicalRecord[]>({
    queryKey: ["records", petId],
    queryFn: async () => {
      const response = await recordService.getByPetId(petId);
      return response.data;
    },
    enabled: !!petId,
  });

  if (petLoading || recordsLoading) {
    return <Loading message="Loading pet details..." />;
  }

  if (petError || recordsError || !pet) {
    return (
      <Error
        message="Error loading pet details"
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  const vaccines = records?.filter((r) => r.record_type === "vaccine") || [];
  const allergies = records?.filter((r) => r.record_type === "allergy") || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <NavLink to="/pets" variant="text">
            ← Back to Pets
          </NavLink>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/pets/${petId}/edit`)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit Pet
            </button>
            <button
              onClick={() => console.log("Delete pet:", petId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Pet
            </button>
          </div>
        </div>

        {/* Pet Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{pet.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Animal Type</p>
              <p className="text-lg font-semibold capitalize">
                {pet.animal_type}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Owner Name</p>
              <p className="text-lg font-semibold">{pet.owner_name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Date of Birth</p>
              <p className="text-lg font-semibold">
                {new Date(pet.date_of_birth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Age</p>
              <p className="text-lg font-semibold">
                {Math.floor(
                  (new Date().getTime() -
                    new Date(pet.date_of_birth).getTime()) /
                    (1000 * 60 * 60 * 24 * 365)
                )}{" "}
                years old
              </p>
            </div>
          </div>
        </div>

        {/* Medical Records Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <button
              onClick={() => console.log("Add record for pet:", petId)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Record
            </button>
          </div>

          {/* Vaccines */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Vaccines ({vaccines.length})
            </h3>
            {vaccines.length > 0 ? (
              <div className="space-y-3">
                {vaccines.map((vaccine) => (
                  <MedicalRecordCard
                    key={vaccine.id}
                    record={vaccine}
                    onEdit={(id) => console.log("Edit vaccine:", id)}
                    onDelete={(id) => console.log("Delete vaccine:", id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No vaccines recorded</p>
            )}
          </div>

          {/* Allergies */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Allergies ({allergies.length})
            </h3>
            {allergies.length > 0 ? (
              <div className="space-y-3">
                {allergies.map((allergy) => (
                  <MedicalRecordCard
                    key={allergy.id}
                    record={allergy}
                    onEdit={(id) => console.log("Edit allergy:", id)}
                    onDelete={(id) => console.log("Delete allergy:", id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No allergies recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetail;
