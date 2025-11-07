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
import ConfirmModal from "../components/ConfirmModal";

function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const petId = id ? parseInt(id, 10) : 0;
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showDeleteRecordConfirm, setShowDeleteRecordConfirm] = useState<{
    isOpen: boolean;
    recordId: number | null;
    recordName: string;
  }>({ isOpen: false, recordId: null, recordName: "" });
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      navigate("/pets");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete pet. Please try again.";
      setDeleteError(errorMessage);
      // Auto-hide error after 5 seconds
      setTimeout(() => setDeleteError(null), 5000);
    },
  });

  const handleDelete = () => {
    if (!pet) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: number) => recordService.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleDeleteRecord = (recordId: number, recordName: string) => {
    setShowDeleteRecordConfirm({ isOpen: true, recordId, recordName });
  };

  const handleConfirmDeleteRecord = () => {
    if (showDeleteRecordConfirm.recordId) {
      deleteRecordMutation.mutate(showDeleteRecordConfirm.recordId);
      setShowDeleteRecordConfirm({
        isOpen: false,
        recordId: null,
        recordName: "",
      });
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
    return <Error message="Error loading pet details" />;
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

        {/* Error Message */}
        {deleteError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <p className="text-red-800">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-600 hover:text-red-800 text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Pet Information Card */}
        <PetInfoCard pet={pet} />

        {/* Medical Records Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const exportData = {
                    pet: {
                      id: pet.id,
                      name: pet.name,
                      animal_type: pet.animal_type,
                      owner_name: pet.owner_name,
                      date_of_birth: pet.date_of_birth,
                    },
                    records: records || [],
                    exportedAt: new Date().toISOString(),
                  };
                  const dataStr = JSON.stringify(exportData, null, 2);
                  const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${pet.name}_medical_records_${
                    new Date().toISOString().split("T")[0]
                  }.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                title="Export pet records as JSON"
              >
                📥 Export Records
              </button>
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Record
              </button>
            </div>
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pet"
        message={`Are you sure you want to delete "${pet?.name}"?\n\nThis will also delete all associated medical records (vaccines and allergies).\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={showDeleteRecordConfirm.isOpen}
        onClose={() =>
          setShowDeleteRecordConfirm({
            isOpen: false,
            recordId: null,
            recordName: "",
          })
        }
        onConfirm={handleConfirmDeleteRecord}
        title="Delete Medical Record"
        message={`Are you sure you want to delete "${showDeleteRecordConfirm.recordName}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default PetDetail;
