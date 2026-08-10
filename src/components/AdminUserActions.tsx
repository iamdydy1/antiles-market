"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "MODERATOR" | "ADMIN";

export default function AdminUserActions({ userId, role, isBanned, actorRole }: { userId: string; role: Role; isBanned: boolean; actorRole: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "BAN" | "UNBAN" | "SET_ROLE", nextRole?: Role) {
    if (loading) return;
    if (action === "BAN" && !window.confirm("Bannir cet utilisateur ?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, role: nextRole }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Action impossible.");
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const moderatorRestricted = actorRole === "MODERATOR" && role !== "USER";

  return (
    <div className="adminUserActions">
      {!moderatorRestricted && (
        isBanned
          ? <button disabled={loading} onClick={() => act("UNBAN")}>Débannir</button>
          : <button className="dangerAction" disabled={loading} onClick={() => act("BAN")}>Bannir</button>
      )}
      {actorRole === "ADMIN" && (
        <select value={role} disabled={loading} onChange={(event) => act("SET_ROLE", event.target.value as Role)}>
          <option value="USER">Utilisateur</option>
          <option value="MODERATOR">Modérateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      )}
      {moderatorRestricted && <small>Compte protégé</small>}
      {error && <small className="inlineError">{error}</small>}
    </div>
  );
}
