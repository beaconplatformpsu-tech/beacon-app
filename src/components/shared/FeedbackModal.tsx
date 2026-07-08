"use client";

import { useState } from "react";
import { MessageSquarePlus, Star, Loader2, Send } from "lucide-react";
import { ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export function FeedbackModal() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [type, setType] = useState("General");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.uid) {
      toast.error("Error", "You must be logged in to submit feedback.");
      return;
    }

    setLoading(true);
    try {
      const feedbacksRef = ref(db, 'feedbacks');
      const newFeedbackRef = push(feedbacksRef);
      await set(newFeedbackRef, {
        userId: session.uid,
        subject,
        message,
        rating,
        feedbackType: type,
        status: "Pending",
        submittedAt: new Date().toISOString()
      });

      toast.success("Thank you!", "Your evaluation has been submitted.");
      setOpen(false);
      // Reset form
      setSubject("");
      setMessage("");
      setRating(5);
      setType("General");
    } catch (error) {
      console.error("Feedback error", error);
      toast.error("Error", "Failed to submit feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow bg-primary hover:bg-primary/90 text-primary-foreground z-50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
          size="icon"
          aria-label="Feedback"
        >
          <MessageSquarePlus className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Platform Evaluation</DialogTitle>
          <DialogDescription>
            Help us improve Beacon by submitting your feedback, bug reports, or feature requests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              {["General", "Bug Report", "Enhancement"].map((t) => (
                <Badge
                  key={t}
                  variant={type === t ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setType(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating ({rating}/5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer transition-colors ${rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground opacity-30"}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input 
              required 
              placeholder="Brief summary of your feedback" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              required 
              placeholder="Tell us what you think or describe the issue..." 
              className="min-h-[100px]"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Inline Badge component for self-containment if not imported properly
function Badge({ variant = "default", className = "", ...props }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
