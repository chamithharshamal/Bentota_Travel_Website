"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Alert, Card } from "@/components/ui/misc";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { docRef } from "./hooks";

/** Loads a document once (not live), so edits in progress are never overwritten. */
export function useDocOnce<T>(collection: string, id: string) {
  const isNew = id === "new";
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    getDoc(docRef(collection, id))
      .then((snap) => {
        if (cancelled) return;
        if (!snap.exists()) setError("This item does not exist. It may have been deleted.");
        else setData({ id: snap.id, ...snap.data() } as T);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [collection, id, isNew]);

  return { data, loading, error, isNew };
}

export function useEditorActions({ endpoint, listHref, id, noun }: { endpoint: string; listHref: string; id: string; noun: string }) {
  const router = useRouter();
  const isNew = id === "new";
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function save(body: unknown) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (isNew) {
        const res = await apiFetch<{ id: string }>(endpoint, { method: "POST", body });
        router.replace(`${listHref}/${res.id}`);
        setNotice(`${noun} created. The website updates within a few minutes.`);
      } else {
        await apiFetch(`${endpoint}/${id}`, { method: "PUT", body });
        setNotice("Changes saved. The website updates within a few minutes.");
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
      router.push(listHref);
    } catch (e) {
      setError(errorMessage(e));
      setDeleting(false);
    }
  }

  return { save, remove, saving, deleting, error, notice, isNew, setError };
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ocean-950/60">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </Card>
  );
}

export function EditorFooter({
  actions,
  saveLabel,
  onSave,
}: {
  actions: ReturnType<typeof useEditorActions>;
  saveLabel: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-ocean-900/10 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {(actions.error || actions.notice) && (
        <div className="mb-3">
          {actions.error ? <Alert>{actions.error}</Alert> : <Alert tone="palm">{actions.notice}</Alert>}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        {!actions.isNew ? (
          <Button variant="ghost" className="text-danger hover:bg-danger-100" onClick={actions.remove} disabled={actions.deleting}>
            {actions.deleting ? "Deleting…" : "Delete"}
          </Button>
        ) : (
          <span />
        )}
        <Button variant="dark" size="lg" onClick={onSave} disabled={actions.saving}>
          {actions.saving ? "Saving…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export function toNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
