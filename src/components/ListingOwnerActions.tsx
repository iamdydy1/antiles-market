"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "PUBLISHED" | "RESERVED" | "SOLD" | "ARCHIVED";

export default function ListingOwnerActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!response.ok) setError(data.error ?? "Action impossible.");
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm("Retirer cette annonce ? Elle ne sera plus visible publiquement.")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Suppression impossible.");
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ownerActionBlock">
      <div className="myListingActions">
        <a href={`/mes-annonces/${id}/modifier`}>Modifier</a>
        {status !== "RESERVED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("RESERVED")}>Réserver</button>}
        {status !== "SOLD" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("SOLD")}>Vendu</button>}
        {status !== "ARCHIVED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("ARCHIVED")}>Archiver</button>}
        {status !== "PUBLISHED" && status !== "REMOVED" && <button disabled={loading} onClick={() => changeStatus("PUBLISHED")}>Republier</button>}
        {status !== "REMOVED" && <button className="dangerAction" disabled={loading} onClick={remove}>Supprimer</button>}
      </div>
      {error && <small className="inlineError">{error}</small>}
    </div>
  );
}
