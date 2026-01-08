import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertRecruiter } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useRecruiters() {
  return useQuery({
    queryKey: [api.recruiters.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.recruiters.list.path);
      return api.recruiters.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRecruiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertRecruiter) => {
      const res = await apiRequest("POST", api.recruiters.create.path, data);
      return api.recruiters.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recruiters.list.path] });
      toast({ title: "Success", description: "Recruiter added" });
    },
  });
}

export function useDeleteRecruiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.recruiters.delete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recruiters.list.path] });
      toast({ title: "Removed", description: "Recruiter removed" });
    },
  });
}
