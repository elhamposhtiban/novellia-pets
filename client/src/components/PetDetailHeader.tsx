import { useNavigate } from "react-router-dom";
import NavLink from "./NavLink";

interface PetDetailHeaderProps {
  petId: number;
  onDelete: () => void;
  isDeleting?: boolean;
}

function PetDetailHeader({ petId, onDelete, isDeleting = false }: PetDetailHeaderProps) {
  const navigate = useNavigate();

  return (
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
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Pet"}
        </button>
      </div>
    </div>
  );
}

export default PetDetailHeader;

