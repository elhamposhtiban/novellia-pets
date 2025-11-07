import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { Pet } from "../types";
import PetCard from "../components/PetCard";
import Loading from "../components/Loading";
import Error from "../components/Error";
import PetFormModal from "../components/PetFormModal";
import NavLink from "../components/NavLink";

function PetList() {
  const [search, setSearch] = useState<string>("");
  const [animalType, setAnimalType] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const {
    data: pets,
    isLoading,
    error,
  } = useQuery<Pet[]>({
    queryKey: ["pets", search, animalType],
    queryFn: async () => {
      const response = await petService.getAll(
        search || undefined,
        animalType || undefined
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <Loading message="Loading pets..." />;
  }

  if (error) {
    return <Error message="Error loading pets" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <NavLink to="/" variant="text">
              Back to Dashboard
            </NavLink>
            <h1 className="text-3xl font-bold">Pets</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Pet
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pets..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pets List */}
        {pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onViewDetails={(id) => console.log("View details:", id)}
                onEdit={(id) => console.log("Edit:", id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500">No pets found</p>
          </div>
        )}
      </div>

      <PetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default PetList;
