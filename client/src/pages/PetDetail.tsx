import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { recordService } from "../services/recordService";
import { Pet, MedicalRecord } from "../types";
import Loading from "../components/Loading";
import Error from "../components/Error";
import NavLink from "../components/NavLink";
import MedicalRecordCard from "../components/MedicalRecordCard";
import PetInfoCard from "../components/PetInfoCard";
import RecordFormModal from "../components/RecordFormModal";

function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const petId = id ? parseInt(id, 10) : 0;
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);

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

  const vaccines = useMemo(
    () => records?.filter((r) => r.record_type === "vaccine") || [],
    [records]
  );
  const allergies = useMemo(
    () => records?.filter((r) => r.record_type === "allergy") || [],
    [records]
  );

  const deleteMutation = useMutation({
    mutationFn: () => petService.delete(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate("/pets");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${pet?.name}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: number) => recordService.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleDeleteRecord = (recordId: number, recordName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${recordName}"? This action cannot be undone.`
      )
    ) {
      deleteRecordMutation.mutate(recordId);
    }
  };

  const handleEditRecord = (recordId: number) => {
    const record = records?.find((r) => r.id === recordId);
    if (record) {
      setEditingRecordId(recordId);
      setIsRecordModalOpen(true);
    }
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setEditingRecordId(null);
  };

  if (petLoading || recordsLoading) {
    return <Loading message="Loading pet details..." />;
  }

  if (petError || recordsError || !pet) {
    return (
      <Error
        message="Error loading pet details"
        onRetry={() => window.location.reload()}
      />
    );
  }

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
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Pet"}
            </button>
          </div>
        </div>

        {/* Pet Information Card */}
        <PetInfoCard pet={pet} />

        {/* Medical Records Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <button
              onClick={() => setIsRecordModalOpen(true)}
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
                    onEdit={handleEditRecord}
                    onDelete={(id) => handleDeleteRecord(id, vaccine.name)}
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
                    onEdit={handleEditRecord}
                    onDelete={(id) => handleDeleteRecord(id, allergy.name)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No allergies recorded</p>
            )}
          </div>
        </div>
      </div>

      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={handleCloseRecordModal}
        petId={petId}
        record={
          editingRecordId
            ? records?.find((r) => r.id === editingRecordId) || null
            : null
        }
      />
    </div>
  );
}

export default PetDetail;
