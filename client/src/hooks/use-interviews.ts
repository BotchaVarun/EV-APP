import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertInterview } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useInterviews() {
  return useQuery({
    queryKey: [api.interviews.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.interviews.list.path);
      return api.interviews.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInterview) => {
      const res = await apiRequest("POST", api.interviews.create.path, data);
      return api.interviews.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      toast({ title: "Scheduled", description: "Interview added to calendar" });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.interviews.delete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      toast({ title: "Removed", description: "Interview removed" });
    },
  });
}
