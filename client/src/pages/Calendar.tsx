import { useInterviews } from "@/hooks/use-interviews";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Video, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplications } from "@/hooks/use-applications";
import { useCreateInterview, useDeleteInterview } from "@/hooks/use-interviews";
import { cn } from "@/lib/utils";
import type { InsertInterview } from "@shared/schema";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FileText, Download } from "lucide-react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: interviews, isLoading } = useInterviews();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  if (isLoading) return <div>Loading calendar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1">Track upcoming interviews.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-2" /> Schedule Interview
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft size={16} /></Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight size={16} /></Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[500px]">
          {days.map((day, i) => {
            const dayInterviews = interviews?.filter(int => isSameDay(new Date(int.interviewDate), day));

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-b border-r border-slate-100 p-2 min-h-[100px] hover:bg-slate-50 transition-colors",
                  !isSameMonth(day, currentDate) && "bg-slate-50/30 text-slate-400",
                  i % 7 === 6 && "border-r-0"
                )}
              >
                <div className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-2",
                  isToday(day) ? "bg-primary text-white" : "text-slate-700"
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayInterviews?.map(interview => (
                    <InterviewItem key={interview.id} interview={interview} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddInterviewDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

function InterviewItem({ interview }: { interview: any }) {
  const { data: app } = useApplications(); // This is inefficient in a loop, normally we'd join in backend or fetch all apps once
  // For now, assuming interview object might not have app name directly if not joined.
  // Ideally, backend should return application details with interview.

  // Workaround: if backend doesn't join, we rely on the client cache of applications
  // But let's assume we just show round and time

  const { mutate: deleteInterview } = useDeleteInterview();

  return (
    <div className="group relative bg-purple-50 border border-purple-100 rounded-lg p-1.5 text-xs cursor-pointer hover:bg-purple-100 transition-colors">
      <div className="font-semibold text-purple-900 truncate">{interview.round}</div>
      <div className="text-purple-700">{format(new Date(interview.interviewDate), 'h:mm a')}</div>

      <button
        onClick={(e) => { e.stopPropagation(); deleteInterview(interview.id); }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-purple-400 hover:text-red-500 transition-opacity"
      >
        <Trash2 size={12} />
      </button>

      {interview.resumeUrl && (
        <a
          href={interview.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-1 right-1 text-purple-400 hover:text-purple-700"
          title="Download Resume"
        >
          <FileText size={12} />
        </a>
      )}
    </div>
  );
}

function AddInterviewDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const { data: applications } = useApplications();
  const { mutate: create, isPending } = useCreateInterview();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);

    // Combine date and time
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const interviewDate = new Date(`${date}T${time}`).toISOString();

    let resumeUrl = "";
    const resumeFile = formData.get("resume") as File;
    if (resumeFile && resumeFile.size > 0) {
      try {
        const storageRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`);
        const snapshot = await uploadBytes(storageRef, resumeFile);
        resumeUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload resume");
        setIsUploading(false);
        return;
      }
    }

    const data: InsertInterview = {
      applicationId: formData.get("applicationId") as string,
      round: formData.get("round") as string,
      mode: formData.get("mode") as string,
      interviewDate: interviewDate as unknown as Date,
      link: formData.get("link") as string,
      resumeUrl: resumeUrl || undefined,
      notes: formData.get("notes") as string,
      completed: false
    };

    create(data, {
      onSuccess: () => {
        setIsUploading(false);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationId">Application</Label>
            <Select name="applicationId" required>
              <SelectTrigger><SelectValue placeholder="Select application" /></SelectTrigger>
              <SelectContent>
                {applications?.map(app => (
                  <SelectItem key={app.id} value={app.id.toString()}>{app.company} - {app.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="round">Round Type</Label>
              <Select name="round" defaultValue="Screening">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select name="mode" defaultValue="Video">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video Call</SelectItem>
                  <SelectItem value="Phone">Phone Call</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" type="time" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Meeting Link / Address</Label>
            <Input id="link" name="link" placeholder="Zoom link or office address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume / Attachment</Label>
            <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || isUploading}>
              {isUploading ? "Uploading..." : (isPending ? "Scheduling..." : "Schedule")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
