import { useRecruiters, useCreateRecruiter, useDeleteRecruiter } from "@/hooks/use-recruiters";
import { useState } from "react";
import { Plus, Mail, Phone, Linkedin, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InsertRecruiter } from "@shared/schema";

export default function Recruiters() {
  const { data: recruiters, isLoading } = useRecruiters();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) return <div>Loading recruiters...</div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiters</h1>
          <p className="text-slate-500 mt-1">Keep track of your contacts.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-2" /> Add Recruiter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recruiters?.map(recruiter => (
          <RecruiterCard key={recruiter.id} recruiter={recruiter} />
        ))}
        {recruiters?.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No recruiters added yet.
          </div>
        )}
      </div>

      <AddRecruiterDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

function RecruiterCard({ recruiter }: { recruiter: any }) {
  const { mutate: deleteRecruiter } = useDeleteRecruiter();

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
             <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{recruiter.name}</h3>
            <p className="text-sm text-slate-500">{recruiter.company}</p>
          </div>
        </div>
        <button 
          onClick={() => deleteRecruiter(recruiter.id)}
          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {recruiter.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <a href={`mailto:${recruiter.email}`} className="hover:text-primary">{recruiter.email}</a>
          </div>
        )}
        {recruiter.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            <span>{recruiter.phone}</span>
          </div>
        )}
        {recruiter.linkedin && (
          <div className="flex items-center gap-2">
            <Linkedin size={14} className="text-slate-400" />
            <a href={recruiter.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
          </div>
        )}
      </div>

      {recruiter.notes && (
        <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500">
          {recruiter.notes}
        </div>
      )}
    </div>
  );
}

function AddRecruiterDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const { mutate: create, isPending } = useCreateRecruiter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as InsertRecruiter;
    
    create(data, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recruiter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" name="linkedin" type="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Met at career fair..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Recruiter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
