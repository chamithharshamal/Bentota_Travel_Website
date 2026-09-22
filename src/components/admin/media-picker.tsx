"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Film, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { thumbnailUrl } from "@/lib/cld-url";
import type { MediaAsset, MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaLibrary } from "./hooks";
import { MediaUploadButton } from "./media-upload-button";

function Thumb({ media, className }: { media: MediaAsset; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-ocean-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailUrl(media)} alt={media.altText} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      {media.type === "video" && (
        <span className="absolute right-1.5 bottom-1.5 rounded bg-ocean-950/80 p-1 text-white">
          <Film className="size-3" />
        </span>
      )}
    </div>
  );
}

export function MediaPickerModal({
  open,
  onClose,
  type,
  multiple,
  initial,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  type: MediaType;
  multiple: boolean;
  initial: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const { data, loading } = useMediaLibrary(open);
  const [picked, setPicked] = useState<string[]>(initial);
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter(
      (m) =>
        m.status === "ready" &&
        m.type === type &&
        (!term ||
          m.originalFilename.toLowerCase().includes(term) ||
          m.altText.toLowerCase().includes(term) ||
          m.tags.some((t) => t.includes(term))),
    );
  }, [data, search, type]);

  function toggle(id: string) {
    setPicked((cur) => {
      if (!multiple) return cur[0] === id ? [] : [id];
      return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={type === "image" ? (multiple ? "Choose images" : "Choose an image") : "Choose a video"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="dark"
            onClick={() => {
              onConfirm(picked);
              onClose();
            }}
          >
            Use {picked.length || ""} selected
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input placeholder="Search by file name, alt text or tag" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <MediaUploadButton
          accept={type}
          multiple={multiple}
          variant="outline"
          label={type === "image" ? "Upload images" : "Upload a video"}
          onCreated={(m) => setPicked((cur) => (multiple ? [...cur, m.id] : [m.id]))}
        />
      </div>
      <div className="mt-4">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="Nothing here yet" body={`Upload ${type === "image" ? "images" : "a video"} to add to the library.`} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((m) => {
              const index = picked.indexOf(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    aria-pressed={index >= 0}
                    className={cn("relative block w-full rounded-lg text-left ring-offset-2", index >= 0 && "ring-3 ring-sun-500")}
                  >
                    <Thumb media={m} />
                    {index >= 0 && (
                      <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-sun-500 text-xs font-bold text-ocean-950">
                        {multiple ? index + 1 : <Check className="size-4" />}
                      </span>
                    )}
                    {!m.altText && m.type === "image" && (
                      <span className="absolute top-1.5 left-1.5 rounded bg-danger px-1.5 text-[10px] font-semibold text-white">No alt text</span>
                    )}
                    <span className="mt-1 block truncate text-xs text-ocean-950/70">{m.originalFilename}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

/** Form field for choosing one or more library items, with ordering for galleries. */
export function MediaField({
  label,
  hint,
  type,
  multiple = false,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  type: MediaType;
  multiple?: boolean;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data } = useMediaLibrary();
  const byId = useMemo(() => new Map(data.map((m) => [m.id, m])), [data]);

  function move(index: number, delta: number) {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    onChange(next);
  }

  return (
    <div>
      <p className="text-sm font-medium text-ocean-900">{label}</p>
      {hint && <p className="text-xs text-ocean-950/60">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-3">
        {value.map((id, i) => {
          const m = byId.get(id);
          return (
            <div key={id} className="w-36">
              {m ? (
                <Thumb media={m} />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-danger-100 p-2 text-center text-xs text-danger">
                  Missing or archived
                </div>
              )}
              <div className="mt-1 flex items-center justify-between">
                {multiple ? (
                  <span className="flex">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 disabled:opacity-30" aria-label="Move earlier">
                      <ArrowLeft className="size-3.5" />
                    </button>
                    <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1 disabled:opacity-30" aria-label="Move later">
                      <ArrowRight className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} className="rounded p-1 text-danger" aria-label="Remove">
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex aspect-[4/3] w-36 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ocean-900/20 text-sm text-ocean-800 hover:border-ocean-900/50"
          >
            <Plus className="size-5" />
            {multiple ? "Add" : "Choose"}
          </button>
        )}
        {!multiple && value.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="self-start">
            Change
          </Button>
        )}
      </div>
      {open && (
        <MediaPickerModal open={open} onClose={() => setOpen(false)} type={type} multiple={multiple} initial={value} onConfirm={onChange} />
      )}
    </div>
  );
}
