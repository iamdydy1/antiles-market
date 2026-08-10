"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon?: string | null; parentId?: string | null; parent?: { name: string } | null };
type Location = { id: string; name: string; territoryId: string };

export default function CreateListingForm({ territories, categories, locations }: { territories: Territory[]; categories: Category[]; locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [territoryId, setTerritoryId] = useState(territories[0]?.id ?? ""); const [photoCount, setPhotoCount] = useState(0);
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const availableLocations = useMemo(() => locations.filter((item) => item.territoryId === territoryId), [locations, territoryId]);
  const parents = categories.filter((item) => !item.parentId); const children = categories.filter((item) => item.parentId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true); const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), categoryId: form.get("categoryId"), territoryId: form.get("territoryId"), locationId: form.get("locationId") || undefined, price: form.get("price"), description: form.get("description") }) });
      const data = await response.json(); if (!response.ok) { setError(data.error ?? "Impossible de publier l’annonce."); return; }
      const photos = form.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
      if (photos.length) { const photoForm = new FormData(); photos.forEach((photo) => photoForm.append("photos", photo)); const photoResponse = await fetch(`/api/listings/${data.listing.id}/images`, { method: "POST", body: photoForm }); if (!photoResponse.ok) { const photoError = await photoResponse.json(); setError(`L’annonce a été créée, mais les photos n’ont pas pu être enregistrées : ${photoError.error ?? "erreur inconnue"}`); return; } }
      router.push(`/annonces/${data.listing.slug}`); router.refresh();
    } catch { setError("Impossible de contacter le serveur."); } finally { setLoading(false); }
  }

  return <form className="listingForm" onSubmit={submit}>
    <div className="listingFormSection"><div className="formSectionTitle"><span>1</span><div><h2>Informations générales</h2><p>Décrivez clairement ce que vous proposez.</p></div></div>
      <label className="fullField"><span>Titre de l’annonce *</span><input name="title" minLength={5} maxLength={120} placeholder="Ex. Renault Clio 2018 très bon état" required /></label>
      <div className="formTwoCols"><label><span>Catégorie *</span><select name="categoryId" required defaultValue=""><option value="" disabled>Sélectionnez une catégorie</option>{parents.map((parent) => <optgroup label={`${parent.icon ?? ""} ${parent.name}`} key={parent.id}>{children.filter((child) => child.parentId === parent.id).map((child) => <option value={child.id} key={child.id}>{child.name}</option>)}<option value={parent.id}>Autre — {parent.name}</option></optgroup>)}</select></label>
      <label><span>Île / territoire *</span><select name="territoryId" required value={territoryId} onChange={(e) => setTerritoryId(e.target.value)}>{territories.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label></div>
      <div className="formTwoCols"><label><span>Ville / commune</span><select name="locationId" defaultValue="" key={territoryId}><option value="">Toute l’île / non précisé</option>{availableLocations.map((l) => <option value={l.id} key={l.id}>{l.name}</option>)}</select></label><label className="priceField"><span>Prix *</span><div><input name="price" type="number" min="0" step="0.01" placeholder="0" required /><b>{currency}</b></div></label></div>
      <label className="fullField"><span>Description *</span><textarea name="description" minLength={20} maxLength={5000} rows={9} placeholder="État, caractéristiques, conditions de vente, informations utiles…" required /><small>20 caractères minimum. Ne partagez pas d’informations sensibles.</small></label>
    </div>
    <div className="listingFormSection"><div className="formSectionTitle"><span>2</span><div><h2>Photos</h2><p>Ajoutez jusqu’à 8 photos. La première sera la photo principale.</p></div></div><label className="photoDropPlaceholder photoUploadInput"><strong>📷 Ajouter des photos</strong><span>JPG, PNG ou WebP · 10 Mo maximum par photo</span><span className="photoCount">{photoCount ? `${photoCount} photo${photoCount > 1 ? "s" : ""} sélectionnée${photoCount > 1 ? "s" : ""}` : "Aucune photo sélectionnée"}</span><input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { const count = e.target.files?.length ?? 0; if (count > 8) { setError("Vous pouvez sélectionner 8 photos maximum."); e.target.value = ""; setPhotoCount(0); return; } setError(""); setPhotoCount(count); }} /></label></div>
    {error && <div className="authError" role="alert">{error}</div>}<div className="listingFormActions"><a href="/" className="secondaryButton">Annuler</a><button className="authSubmit" type="submit" disabled={loading}>{loading ? "Publication…" : "Publier mon annonce"}</button></div>
  </form>;
}
