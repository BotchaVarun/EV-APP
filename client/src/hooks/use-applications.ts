import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useApplications() {
  const { toast } = useToast();

  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.applications.list.path);
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await apiRequest("GET", url);
      return api.applications.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertApplication) => {
      const res = await apiRequest("POST", api.applications.create.path, data);
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({ title: "Success", description: "Application tracked successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create application",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertApplication>) => {
      const url = buildUrl(api.applications.update.path, { id });
      const res = await apiRequest("PUT", url, updates);
      return api.applications.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path, data.id] });
      toast({ title: "Updated", description: "Application status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    }
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.applications.delete.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({ title: "Deleted", description: "Application removed from tracker" });
    },
  });
}
