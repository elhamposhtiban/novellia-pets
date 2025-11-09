import { useQuery } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { Pet } from "../types";

export function usePets(search?: string, animalType?: string) {
  return useQuery<Pet[]>({
    queryKey: ["pets", search, animalType],
    queryFn: async () => {
      const response = await petService.getAll(search, animalType);
      return response.data;
    },
  });
}

