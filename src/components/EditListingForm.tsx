"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string; icon?: string | null; currency?: string };
type ListingData = { id: string; title: string; description: string; price: string; categoryId: string; territoryId: string };

export default function EditListingForm({ listing, territories, categories }: { listing: ListingData; territories: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [territoryId, setTerritoryId] = useState(listing.territoryId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          categoryId: form.get("categoryId"),
          territoryId: form.get("territoryId"),
          price: form.get("price"),
          description: form.get("description"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Impossible de modifier l’annonce.");
        return;
      }
      router.push("/mes-annonces");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="listingForm" onSubmit={submit}>
      <div className="listingFormSection">
        <div className="formSectionTitle"><span>✎</span><div><h2>Modifier l’annonce</h2><p>Les changements seront visibles immédiatement.</p></div></div>
        <label className="fullField"><span>Titre</span><input name="title" defaultValue={listing.title} minLength={5} maxLength={120} required /></label>
        <div className="formTwoCols">
          <label><span>Catégorie</span><select name="categoryId" defaultValue={listing.categoryId}>{categories.map((category) => <option value={category.id} key={category.id}>{category.icon} {category.name}</option>)}</select></label>
          <label><span>Île / territoire</span><select name="territoryId" value={territoryId} onChange={(event) => setTerritoryId(event.target.value)}>{territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}</select></label>
        </div>
        <label className="priceField"><span>Prix</span><div><input name="price" type="number" min="0" step="0.01" defaultValue={listing.price} required /><b>{currency}</b></div></label>
        <label className="fullField"><span>Description</span><textarea name="description" rows={10} minLength={20} maxLength={5000} defaultValue={listing.description} required /></label>
      </div>
      {error && <div className="authError">{error}</div>}
      <div className="listingFormActions"><a className="secondaryButton" href="/mes-annonces">Annuler</a><button className="authSubmit" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer les modifications"}</button></div>
    </form>
  );
}
