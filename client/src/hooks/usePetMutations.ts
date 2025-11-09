import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petService } from "../services/petService";
import { CreatePetData, UpdatePetData } from "../types";

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdatePet(petId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePetData) => petService.update(petId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pet", petId] });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.refetchQueries({ queryKey: ["pet", petId] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

