import { useCallback } from "react";
import { MedicalRecord } from "../types";

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function MedicalRecordCard({
  record,
  onEdit,
  onDelete,
}: MedicalRecordCardProps) {
  const isVaccine = record.record_type === "vaccine";
  const isAllergy = record.record_type === "allergy";

  const handleEdit = useCallback(() => {
    onEdit?.(record.id);
  }, [onEdit, record.id]);

  const handleDelete = useCallback(() => {
    onDelete?.(record.id);
  }, [onDelete, record.id]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold">{record.name}</p>

          {/* Vaccine-specific fields */}
          {isVaccine && record.date && (
            <p className="text-sm text-gray-600 mt-1">
              Date: {new Date(record.date).toLocaleDateString()}
            </p>
          )}

          {/* Allergy-specific fields */}
          {isAllergy && record.severity && (
            <p className="text-sm text-gray-600 mt-1">
              Severity:{" "}
              <span
                className={`font-semibold ${
                  record.severity === "severe"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {record.severity.toUpperCase()}
              </span>
            </p>
          )}

          {/* Optional date for allergies */}
          {isAllergy && record.date && (
            <p className="text-sm text-gray-600 mt-1">
              Date: {new Date(record.date).toLocaleDateString()}
            </p>
          )}

          {/* Reactions (can appear in both types) */}
          {record.reactions && (
            <p className="text-sm text-gray-600 mt-1">
              Reactions: {record.reactions}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordCard;
