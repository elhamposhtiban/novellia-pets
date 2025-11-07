import { useNavigate } from "react-router-dom";
import { Pet } from "../types";

interface PetCardProps {
  pet: Pet;
}

function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/pets/${pet.id}`);
  };

  const handleEdit = () => {
    navigate(`/pets/${pet.id}/edit`);
  };

  return (
    <div
      key={pet.id}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{pet.name}</h2>
            <p className="text-gray-600 capitalize">{pet.animal_type}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Owner:</span> {pet.owner_name}
          </p>
          <p>
            <span className="font-medium">Date of Birth:</span>{" "}
            {new Date(pet.date_of_birth).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Details
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default PetCard;
