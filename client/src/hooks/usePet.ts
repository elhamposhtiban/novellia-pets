import { useQuery } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { Pet } from "../types";

export function usePet(id: number, options?: { enabled?: boolean; refetchOnMount?: boolean }) {
  return useQuery<Pet>({
    queryKey: ["pet", id],
    queryFn: async () => {
      const response = await petService.getById(id);
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    refetchOnMount: options?.refetchOnMount,
    refetchOnWindowFocus: false,
  });
}

