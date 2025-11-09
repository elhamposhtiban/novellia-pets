import FormField from "./FormField";
import { CreateRecordFormData } from "../hooks/useRecordForm";

interface RecordFormFieldsProps {
  formData: CreateRecordFormData;
  errors: Partial<Record<keyof CreateRecordFormData, string>>;
  onFieldChange: (
    field: keyof CreateRecordFormData,
    value: string | undefined
  ) => void;
  onRecordTypeChange: (value: string) => void;
}

function RecordFormFields({
  formData,
  errors,
  onFieldChange,
  onRecordTypeChange,
}: RecordFormFieldsProps) {
  const isVaccine = formData.record_type === "vaccine";
  const isAllergy = formData.record_type === "allergy";

  return (
    <>
      <FormField label="Record Type" error={errors.record_type} required>
        <select
          value={formData.record_type}
          onChange={(e) => onRecordTypeChange(e.target.value)}
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
          onChange={(e) => onFieldChange("name", e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={isVaccine ? "Enter vaccine name" : "Enter allergy name"}
        />
      </FormField>

      {isVaccine && (
        <FormField label="Date Administered" error={errors.date} required>
          <input
            type="date"
            value={formData.date || ""}
            onChange={(e) => onFieldChange("date", e.target.value)}
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
              onFieldChange("severity", e.target.value as "mild" | "severe")
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
          onChange={(e) => onFieldChange("reactions", e.target.value)}
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
            onChange={(e) => onFieldChange("date", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </FormField>
      )}
    </>
  );
}

export default RecordFormFields;
