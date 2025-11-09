import { FormEvent } from "react";
import { MedicalRecord } from "../types";
import Modal from "./Modal";
import FormButtons from "./FormButtons";
import RecordFormFields from "./RecordFormFields";
import { useRecordForm } from "../hooks/useRecordForm";

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
  const isEditing = !!record;

  const {
    formData,
    errors,
    isPending,
    handleClose,
    handleSubmit,
    handleChange,
    handleRecordTypeChange,
  } = useRecordForm(petId, record, isOpen, onClose);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Medical Record" : "Add Medical Record"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <RecordFormFields
          formData={formData}
          errors={errors}
          onFieldChange={handleChange}
          onRecordTypeChange={handleRecordTypeChange}
        />

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
