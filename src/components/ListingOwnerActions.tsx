"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Status = "PUBLISHED" | "RESERVED" | "SOLD" | "ARCHIVED";

export default function ListingOwnerActions({ id, status, locale }: { id: string; status: string; locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const copy = locale === "fr"
    ? { actionError: "Action impossible.", removeConfirm: "Retirer cette annonce ? Elle ne sera plus visible publiquement.", removeError: "Suppression impossible.", edit: "Modifier", reserve: "Réserver", sold: "Vendu", archive: "Archiver", republish: "Republier", remove: "Supprimer" }
    : { actionError: "Unable to complete this action.", removeConfirm: "Remove this listing? It will no longer be publicly visible.", removeError: "Unable to delete the listing.", edit: "Edit", reserve: "Reserve", sold: "Mark as sold", archive: "Archive", republish: "Republish", remove: "Delete" };

  async function changeStatus(nextStatus: Status) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? copy.actionError);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(copy.removeConfirm)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? copy.removeError);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ownerActionBlock">
      <div className="myListingActions">
        <a href={`/mes-annonces/${id}/modifier`}>{copy.edit}</a>
        {status !== "RESERVED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("RESERVED")}>{copy.reserve}</button>}
        {status !== "SOLD" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("SOLD")}>{copy.sold}</button>}
        {status !== "ARCHIVED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("ARCHIVED")}>{copy.archive}</button>}
        {status !== "PUBLISHED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("PUBLISHED")}>{copy.republish}</button>}
        {status !== "REMOVED" && <button className="dangerAction" disabled={loading} onClick={remove}>{copy.remove}</button>}
      </div>
      {error && <small className="inlineError">{error}</small>}
    </div>
  );
}
