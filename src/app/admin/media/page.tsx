"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, Film } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/admin/auth-provider";
import { useMediaLibrary } from "@/components/admin/hooks";
import { MediaUploadButton } from "@/components/admin/media-upload-button";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Alert, Badge, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { VideoPlayer } from "@/components/media/video-player";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { imageUrl, thumbnailUrl } from "@/lib/cld-url";
import { formatDateTime } from "@/lib/dates";
import type { MediaAsset } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

type Filter = "all" | "image" | "video" | "archived" | "no-alt";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "no-alt", label: "Missing alt text" },
  { value: "archived", label: "Archived" },
];

const USAGE_LABEL: Record<string, string> = {
  destinations: "Destination",
  routes: "Route",
  packages: "Package",
  settings: "Website settings",
};

function usageHref(path: string) {
  const [collection, id] = path.split("/");
  return collection === "settings" ? "/admin/settings" : `/admin/${collection}/${id}`;
}

export default function MediaLibraryPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <Library />
    </RequireRole>
  );
}

function Library() {
  const { data, loading, error } = useMediaLibrary();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((m) => {
      if (filter === "archived" ? m.status !== "archived" : m.status === "archived") return false;
      if (filter === "image" && m.type !== "image") return false;
      if (filter === "video" && m.type !== "video") return false;
      if (filter === "no-alt" && (m.type !== "image" || m.altText)) return false;
      if (!term) return true;
      return (
        m.originalFilename.toLowerCase().includes(term) ||
        m.altText.toLowerCase().includes(term) ||
        m.tags.some((t) => t.includes(term))
      );
    });
  }, [data, filter, search]);

  const selected = data.find((m) => m.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Media library"
        description="Images up to 10 MB and videos up to 100 MB. Files are optimized and delivered by Cloudinary."
        actions={<MediaUploadButton label="Upload images or videos" />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-ocean-900/10">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn("rounded-full px-3 py-1.5 text-sm font-medium", filter === f.value ? "bg-ocean-900 text-white" : "text-ocean-900 hover:bg-ocean-50")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input placeholder="Search file name, alt text or tag" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <div className="mt-6">
        {error && <Alert>{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title={filter === "archived" ? "Nothing archived" : "No files here"} body="Upload images and videos, then attach them to destinations, routes and packages." />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setSelectedId(m.id)} className="group block w-full text-left">
                  <div className="relative overflow-hidden rounded-lg bg-ocean-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailUrl(m)} alt={m.altText} loading="lazy" className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90" />
                    {m.type === "video" && (
                      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded bg-ocean-950/80 px-1.5 py-0.5 text-xs text-white">
                        <Film className="size-3" />
                        {m.duration ? `${Math.round(m.duration)}s` : "Video"}
                      </span>
                    )}
                    {m.type === "image" && !m.altText && m.status === "ready" && (
                      <span className="absolute top-2 left-2 rounded bg-danger px-1.5 text-[10px] font-semibold text-white">No alt text</span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium">{m.originalFilename || m.publicId}</p>
                  <p className="text-xs text-ocean-950/55">
                    {m.usedBy.length ? `Used in ${m.usedBy.length}` : "Not used"} · {formatBytes(m.bytes)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && <MediaDetails key={selected.id + selected.version} media={selected} onClose={() => setSelectedId(null)} />}
    </>
  );
}

function MediaDetails({ media, onClose }: { media: MediaAsset; onClose: () => void }) {
  const { role } = useAuth();
  const [altText, setAltText] = useState(media.altText);
  const [caption, setCaption] = useState(media.caption);
  const [tags, setTags] = useState(media.tags.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setNotice(null);
  }, [altText, caption, tags]);

  async function patch(body: Record<string, unknown>, done: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/media/${media.id}`, { method: "PATCH", body });
      setNotice(done);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (!window.confirm("Delete this file permanently from Cloudinary? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/media/${media.id}`, { method: "DELETE" });
      onClose();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  const archived = media.status === "archived";

  return (
    <Modal open onClose={onClose} title={media.originalFilename || "Media details"} size="lg">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          {media.type === "video" ? (
            <VideoPlayer media={media} className="rounded-lg" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(media, 960)} alt={media.altText} className="w-full rounded-lg bg-ocean-100" />
          )}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ocean-950/60">Type</dt><dd>{media.type === "video" ? "Video" : "Image"} · {media.format.toUpperCase()}</dd></div>
            <div><dt className="text-ocean-950/60">Size</dt><dd>{formatBytes(media.bytes)}</dd></div>
            {media.width && <div><dt className="text-ocean-950/60">Dimensions</dt><dd className="tabular-nums">{media.width} × {media.height}</dd></div>}
            {media.duration && <div><dt className="text-ocean-950/60">Length</dt><dd>{Math.round(media.duration)} seconds</dd></div>}
            {media.type === "video" && (
              <div>
                <dt className="text-ocean-950/60">Adaptive streaming</dt>
                <dd>
                  {media.streaming === "ready" ? <Badge tone="palm">Ready</Badge> : media.streaming === "pending" ? <Badge tone="sun">Preparing</Badge> : media.streaming === "failed" ? <Badge tone="danger">Failed, MP4 used</Badge> : <Badge>MP4 only</Badge>}
                </dd>
              </div>
            )}
            <div><dt className="text-ocean-950/60">Uploaded</dt><dd>{formatDateTime(media.createdAt)}</dd></div>
          </dl>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(media.publicId)}
            className="mt-3 inline-flex items-center gap-1 text-xs text-ocean-600 hover:underline"
          >
            <Copy className="size-3" /> Copy Cloudinary ID
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Alt text" htmlFor="alt" hint="Describe the image for screen readers and search engines.">
            <Input id="alt" value={altText} maxLength={200} onChange={(e) => setAltText(e.target.value)} />
          </Field>
          <Field label="Caption" htmlFor="caption">
            <Textarea id="caption" className="min-h-16" value={caption} maxLength={500} onChange={(e) => setCaption(e.target.value)} />
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Separate with commas, e.g. galle, beach">
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Button
            variant="dark"
            disabled={busy}
            onClick={() =>
              patch(
                { altText: altText.trim(), caption: caption.trim(), tags: tags.split(",").map((t) => t.trim()).filter(Boolean) },
                "Details saved.",
              )
            }
          >
            Save details
          </Button>

          <div className="border-t border-ocean-900/10 pt-4">
            <p className="text-sm font-medium">Used in</p>
            {media.usedBy.length === 0 ? (
              <p className="text-sm text-ocean-950/60">Not used anywhere.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {media.usedBy.map((path) => (
                  <li key={path}>
                    <Link href={usageHref(path)} className="text-ocean-600 hover:underline">
                      {USAGE_LABEL[path.split("/")[0]!] ?? path}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-ocean-900/10 pt-4">
            {!archived && (
              <div>
                <p className="text-sm font-medium">Replace file</p>
                <p className="mb-2 text-xs text-ocean-950/60">Every page using this file shows the new version.</p>
                <MediaUploadButton
                  accept={media.type}
                  multiple={false}
                  variant="outline"
                  label={`Upload new ${media.type}`}
                  onUploadedRaw={(info) => patch({ replaceWith: info }, "File replaced.")}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {archived ? (
                <>
                  <Button variant="outline" disabled={busy} onClick={() => patch({ status: "ready" }, "Restored to the library.")}>Restore</Button>
                  {role === "admin" && (
                    <Button variant="danger" disabled={busy} onClick={destroy}>Delete permanently</Button>
                  )}
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="text-danger hover:bg-danger-100"
                  disabled={busy || media.usedBy.length > 0}
                  title={media.usedBy.length ? "Remove it from pages before archiving" : undefined}
                  onClick={() => patch({ status: "archived" }, "Archived.")}
                >
                  Archive
                </Button>
              )}
            </div>
          </div>

          {error && <Alert>{error}</Alert>}
          {notice && <Alert tone="palm">{notice}</Alert>}
        </div>
      </div>
    </Modal>
  );
}
