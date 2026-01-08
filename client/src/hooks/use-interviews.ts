import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertInterview, Interview } from "@shared/schema";

export function useInterviews() {
  return useQuery({
    queryKey: [api.interviews.list.path],
    queryFn: async () => {
      const res = await fetch(api.interviews.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interviews");
      return api.interviews.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInterview) => {
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to schedule interview");
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
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviews.delete.path, { id });
      const res = await fetch(url, { 
        method: api.interviews.delete.method,
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to delete interview");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
      toast({ title: "Removed", description: "Interview removed" });
    },
  });
}
