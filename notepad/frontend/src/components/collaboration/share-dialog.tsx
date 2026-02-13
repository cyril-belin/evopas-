"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  toggleNoteSharing,
  addCollaborator,
  removeCollaborator,
  getNoteCollaborators,
  type NoteCollaborator,
  type Note,
} from "@/lib/pocketbase";
import { useNotesStore } from "@/stores/notes-store";
import {
  Globe,
  Link2,
  Copy,
  UserPlus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useEffect } from "react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
}

export function ShareDialog({ open, onOpenChange, note }: ShareDialogProps) {
  const { updateActiveNote } = useNotesStore();
  const [isPublic, setIsPublic] = useState(note.is_public);
  const [allowEdit, setAllowEdit] = useState(note.allow_edit);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [collaborators, setCollaborators] = useState<NoteCollaborator[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      getNoteCollaborators(note.id).then(setCollaborators);
      setIsPublic(note.is_public);
      setAllowEdit(note.allow_edit);
    }
  }, [open, note.id, note.is_public, note.allow_edit]);

  const handleTogglePublic = async (checked: boolean) => {
    setIsPublic(checked);
    const updated = await toggleNoteSharing(note.id, checked);
    await updateActiveNote({ is_public: updated.is_public, share_slug: updated.share_slug });
  };

  const handleToggleEdit = async (checked: boolean) => {
    setAllowEdit(checked);
    await updateActiveNote({ allow_edit: checked });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/share/${note.share_slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addCollaborator(note.id, email.trim(), role);
      const updated = await getNoteCollaborators(note.id);
      setCollaborators(updated);
      setEmail("");
    } catch (e: any) {
      setError(e.message || "Could not invite user");
    }
    setLoading(false);
  };

  const handleRemoveCollaborator = async (id: string) => {
    await removeCollaborator(id);
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const shareUrl = note.share_slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${note.share_slug}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            Share this note publicly or invite collaborators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public sharing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-500" />
                <Label htmlFor="public-toggle">Public link</Label>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={handleTogglePublic}
              />
            </div>

            {isPublic && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="edit-toggle"
                    className="text-sm text-neutral-500"
                  >
                    Allow editing
                  </Label>
                  <Switch
                    id="edit-toggle"
                    checked={allowEdit}
                    onCheckedChange={handleToggleEdit}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invite collaborators */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-neutral-500" />
              <Label>Invite people</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
              />
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "viewer" | "editor")}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={loading} size="sm">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Collaborators list */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <Label className="text-neutral-500">Collaborators</Label>
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 dark:bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {(collab.expand as any)?.user?.email || collab.user}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {collab.role}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveCollaborator(collab.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
