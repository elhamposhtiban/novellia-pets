import { useQuery } from "@tanstack/react-query";
import { recordService } from "../services/recordService";
import { MedicalRecord } from "../types";

export function useRecords(petId: number) {
  return useQuery<MedicalRecord[]>({
    queryKey: ["records", petId],
    queryFn: async () => {
      const response = await recordService.getByPetId(petId);
      return response.data;
    },
    enabled: !!petId,
  });
}

