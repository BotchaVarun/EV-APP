import { useState } from "react";
import { useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, MoreVertical, Trash2, ExternalLink, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { InsertApplication, Application } from "@shared/schema";

const STATUS_OPTIONS = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export default function Applications() {
  const { data: applications, isLoading } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const filteredApps = applications?.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading applications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 mt-1">Manage and track your job applications.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6"
        >
          <Plus size={18} className="mr-2" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by company or role..." 
            className="pl-10 border-slate-200 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-slate-200">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps?.map(app => (
          <ApplicationCard 
            key={app.id} 
            app={app} 
            onEdit={() => setEditingApp(app)}
          />
        ))}
        {filteredApps?.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No applications found matching your criteria.
          </div>
        )}
      </div>

      <ApplicationDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        mode="create" 
      />
      
      {editingApp && (
        <ApplicationDialog 
          open={!!editingApp} 
          onOpenChange={(open) => !open && setEditingApp(null)} 
          mode="edit" 
          defaultValues={editingApp} 
        />
      )}
    </div>
  );
}

function ApplicationCard({ app, onEdit }: { app: Application; onEdit: () => void }) {
  const { mutate: deleteApp } = useDeleteApplication();

  return (
    <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/20 transition-all duration-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-lg border border-slate-100">
          {app.company.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={app.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {app.url && (
                <DropdownMenuItem onClick={() => window.open(app.url!, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" /> View Job Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteApp(app.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <h3 className="font-bold text-slate-900 truncate pr-4">{app.title}</h3>
      <p className="text-slate-500 text-sm mb-4">{app.company}</p>
      
      <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-50 pt-3">
        <span>{format(new Date(app.createdAt!), 'MMM d, yyyy')}</span>
        {app.location && <span>• {app.location}</span>}
      </div>
    </div>
  );
}

function ApplicationDialog({ 
  open, 
  onOpenChange, 
  mode, 
  defaultValues 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  mode: "create" | "edit";
  defaultValues?: Application;
}) {
  const { mutate: create, isPending: isCreating } = useCreateApplication();
  const { mutate: update, isPending: isUpdating } = useUpdateApplication();
  
  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<InsertApplication> = {
      company: formData.get("company") as string,
      title: formData.get("title") as string,
      status: formData.get("status") as string,
      location: formData.get("location") as string,
      url: formData.get("url") as string,
      notes: formData.get("notes") as string,
      salary: formData.get("salary") as string,
    };

    if (mode === "create") {
      create(data as InsertApplication, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      update({ id: defaultValues!.id, ...data }, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Application" : "Edit Application"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={defaultValues?.company} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" defaultValue={defaultValues?.title} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={defaultValues?.status || "Saved"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={defaultValues?.location || ""} />
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="salary">Salary Range</Label>
             <Input id="salary" name="salary" placeholder="e.g. $120k - $150k" defaultValue={defaultValues?.salary || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Job Posting URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." defaultValue={defaultValues?.url || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Key requirements, tech stack..." defaultValue={defaultValues?.notes || ""} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (mode === "create" ? "Add Application" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
