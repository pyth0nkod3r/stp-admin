import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, UserCheck } from "lucide-react";
import { useEditUserMutation } from "@/hooks/useUsersMutations";
import type { User } from "@/lib/type";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cohort: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editUserMutation = useEditUserMutation();

  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        cohort: (user as any).cohort || "",
      });
      setErrorMessage(null);
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrorMessage(null);

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setErrorMessage("First name, last name, and email address are required.");
      return;
    }

    try {
      await editUserMutation.mutateAsync({
        userId: user.userId,
        payload: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          ...(formData.cohort.trim() ? { cohort: formData.cohort.trim() } : {}),
        },
      });
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred while updating the user.";
      setErrorMessage(msg);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Edit Alumni User</DialogTitle>
          </div>
          <DialogDescription>
            Update profile information for <strong>{user.firstName} {user.lastName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle className="text-xs font-semibold">Server Update Failed</AlertTitle>
              <AlertDescription className="text-xs mt-0.5 font-mono break-all">
                {errorMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first-name" className="text-xs font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-first-name"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="First name"
                disabled={editUserMutation.isPending}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-last-name" className="text-xs font-medium">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-last-name"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Last name"
                disabled={editUserMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email" className="text-xs font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="alumni@example.com"
              disabled={editUserMutation.isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-cohort" className="text-xs font-medium">
              Graduation Cohort / Class Year
            </Label>
            <Input
              id="edit-cohort"
              value={formData.cohort}
              onChange={(e) => setFormData((prev) => ({ ...prev, cohort: e.target.value }))}
              placeholder="e.g., 2023"
              disabled={editUserMutation.isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Optional — year or identifier for this alumni's cohort.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={editUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editUserMutation.isPending}>
              {editUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
