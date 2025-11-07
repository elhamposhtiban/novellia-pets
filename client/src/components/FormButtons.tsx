interface FormButtonsProps {
  onCancel: () => void;
  onSubmit: (e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitButtonColor?: string;
}

function FormButtons({
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  submitButtonColor = "bg-blue-600 hover:bg-blue-700",
}: FormButtonsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        disabled={isSubmitting}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        className={`flex-1 px-4 py-2 ${submitButtonColor} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : submitLabel}
      </button>
    </div>
  );
}

export default FormButtons;
