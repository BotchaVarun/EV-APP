import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertRecruiter, Recruiter } from "@shared/schema";

export function useRecruiters() {
  return useQuery({
    queryKey: [api.recruiters.list.path],
    queryFn: async () => {
      const res = await fetch(api.recruiters.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recruiters");
      return api.recruiters.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRecruiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertRecruiter) => {
      const res = await fetch(api.recruiters.create.path, {
        method: api.recruiters.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to add recruiter");
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
    mutationFn: async (id: number) => {
      const url = buildUrl(api.recruiters.delete.path, { id });
      const res = await fetch(url, { 
        method: api.recruiters.delete.method,
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to delete recruiter");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recruiters.list.path] });
      toast({ title: "Removed", description: "Recruiter removed" });
    },
  });
}
