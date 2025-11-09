import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordService } from "../services/recordService";
import { CreateRecordData, UpdateRecordData } from "../types";

export function useCreateRecord(petId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecordData) => recordService.create(petId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateRecord(petId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recordId,
      ...data
    }: UpdateRecordData & { recordId: number }) =>
      recordService.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteRecord(petId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: number) => recordService.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", petId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

