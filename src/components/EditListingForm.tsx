"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency?: string };
type Category = { id: string; name: string; slug: string; icon?: string | null; parentId?: string | null; parent?: { slug: string } | null };
type ListingData = { id: string; title: string; description: string; price: string; categoryId: string; territoryId: string; vehicleMileage: number | null };

export default function EditListingForm({ listing, territories, categories, locale }: { listing: ListingData; territories: Territory[]; categories: Category[]; locale: "fr" | "en" }) {
  const router = useRouter();
  const fr = locale === "fr";
  const [territoryId, setTerritoryId] = useState(listing.territoryId);
  const [categoryId, setCategoryId] = useState(listing.categoryId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const selected = categories.find((item) => item.id === categoryId);
  const isVehicle = selected?.slug.startsWith("vehicules") || selected?.parent?.slug === "vehicules";

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
          vehicleMileage: isVehicle ? (form.get("vehicleMileage") || null) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? (fr ? "Impossible de modifier l’annonce." : "Unable to update the listing."));
        return;
      }
      router.push("/mes-annonces");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return <form className="listingForm" onSubmit={submit}>
    <div className="listingFormSection">
      <div className="formSectionTitle"><span>✎</span><div><h2>{fr ? "Modifier l’annonce" : "Edit listing"}</h2><p>{fr ? "Les changements seront visibles immédiatement." : "Changes will be visible immediately."}</p></div></div>
      <label className="fullField"><span>{fr ? "Titre" : "Title"}</span><input name="title" defaultValue={listing.title} minLength={5} maxLength={120} required /></label>
      <div className="formTwoCols">
        <label><span>{fr ? "Catégorie" : "Category"}</span><select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option value={category.id} key={category.id}>{category.icon} {category.name}</option>)}</select></label>
        <label><span>{fr ? "Île / territoire" : "Island / territory"}</span><select name="territoryId" value={territoryId} onChange={(event) => setTerritoryId(event.target.value)}>{territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}</select></label>
      </div>
      <label className="priceField"><span>{fr ? "Prix" : "Price"}</span><div><input name="price" type="number" min="0" step="0.01" defaultValue={listing.price} required /><b>{currency}</b></div></label>
      {isVehicle && <label className="priceField"><span>{fr ? "Kilométrage" : "Mileage"}</span><div><input name="vehicleMileage" type="number" min="0" max="5000000" step="1" defaultValue={listing.vehicleMileage ?? ""} placeholder="85000" /><b>km</b></div></label>}
      <label className="fullField"><span>{fr ? "Description" : "Description"}</span><textarea name="description" rows={10} minLength={20} maxLength={5000} defaultValue={listing.description} required /></label>
    </div>
    {error && <div className="authError">{error}</div>}
    <div className="listingFormActions"><a className="secondaryButton" href="/mes-annonces">{fr ? "Annuler" : "Cancel"}</a><button className="authSubmit" disabled={loading}>{loading ? (fr ? "Enregistrement…" : "Saving…") : (fr ? "Enregistrer les modifications" : "Save changes")}</button></div>
  </form>;
}
