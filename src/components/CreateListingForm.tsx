"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency: string };
type Category = { id: string; name: string; slug: string; icon?: string | null; parentId?: string | null; parent?: { name: string; slug: string } | null };
type Location = { id: string; name: string; territoryId: string };

export default function CreateListingForm({ territories, categories, locations, locale }: { territories: Territory[]; categories: Category[]; locations: Location[]; locale: "fr" | "en" }) {
  const router = useRouter();
  const fr = locale === "fr";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [territoryId, setTerritoryId] = useState(territories[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [photoCount, setPhotoCount] = useState(0);

  const currency = useMemo(() => territories.find((i) => i.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const availableLocations = useMemo(() => locations.filter((i) => i.territoryId === territoryId), [locations, territoryId]);
  const parents = categories.filter((i) => !i.parentId);
  const children = categories.filter((i) => i.parentId);
  const selected = categories.find((i) => i.id === categoryId);
  const isEvent = selected?.slug.startsWith("evenements-sorties") || selected?.parent?.slug === "evenements-sorties";
  const isVehicle = selected?.slug.startsWith("vehicules") || selected?.parent?.slug === "vehicules";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const payload: Record<string, unknown> = {
        title: form.get("title"),
        categoryId: form.get("categoryId"),
        territoryId: form.get("territoryId"),
        locationId: form.get("locationId") || undefined,
        price: form.get("price"),
        description: form.get("description"),
      };

      if (isVehicle) payload.vehicleMileage = form.get("vehicleMileage") || undefined;
      if (isEvent) {
        payload.eventStartAt = form.get("eventStartAt");
        payload.eventEndAt = form.get("eventEndAt");
        payload.eventVenue = form.get("eventVenue");
        payload.eventOrganizer = form.get("eventOrganizer");
        payload.eventUrl = form.get("eventUrl");
        payload.eventCapacity = form.get("eventCapacity") || undefined;
        payload.eventIsFree = form.get("eventIsFree") === "on";
      }

      const response = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? (fr ? "Impossible de publier l’annonce." : "Unable to publish the listing."));
        return;
      }

      const photos = form.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
      if (photos.length) {
        const pf = new FormData();
        photos.forEach((p) => pf.append("photos", p));
        const pr = await fetch(`/api/listings/${data.listing.id}/images`, { method: "POST", body: pf });
        if (!pr.ok) {
          const pe = await pr.json();
          setError(fr ? `L’annonce a été créée, mais les photos n’ont pas pu être enregistrées : ${pe.error ?? "erreur inconnue"}` : `The listing was created, but the photos could not be saved: ${pe.error ?? "unknown error"}`);
          return;
        }
      }

      router.push(`/annonces/${data.listing.slug}`);
      router.refresh();
    } catch {
      setError(fr ? "Impossible de contacter le serveur." : "Unable to contact the server.");
    } finally {
      setLoading(false);
    }
  }

  return <form className="listingForm" onSubmit={submit}>
    <div className="listingFormSection">
      <div className="formSectionTitle"><span>1</span><div><h2>{fr ? "Informations générales" : "General information"}</h2><p>{fr ? "Décrivez clairement ce que vous proposez." : "Clearly describe what you are offering."}</p></div></div>
      <label className="fullField"><span>{fr ? "Titre de l’annonce *" : "Listing title *"}</span><input name="title" minLength={5} maxLength={120} required /></label>
      <div className="formTwoCols">
        <label><span>{fr ? "Catégorie *" : "Category *"}</span><select name="categoryId" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="" disabled>{fr ? "Sélectionnez une catégorie" : "Select a category"}</option>{parents.map((p) => <optgroup label={`${p.icon ?? ""} ${p.name}`} key={p.id}>{children.filter((c) => c.parentId === p.id).map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}<option value={p.id}>{fr ? "Autre" : "Other"} — {p.name}</option></optgroup>)}</select></label>
        <label><span>{fr ? "Île / territoire *" : "Island / territory *"}</span><select name="territoryId" required value={territoryId} onChange={(e) => setTerritoryId(e.target.value)}>{territories.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      </div>
      <div className="formTwoCols">
        <label><span>{fr ? "Ville / commune" : "City / town"}</span><select name="locationId" defaultValue="" key={territoryId}><option value="">{fr ? "Toute l’île / non précisé" : "Whole island / not specified"}</option>{availableLocations.map((l) => <option value={l.id} key={l.id}>{l.name}</option>)}</select></label>
        <label className="priceField"><span>{fr ? "Prix *" : "Price *"}</span><div><input name="price" type="number" min="0" step="0.01" placeholder="0" required /><b>{currency}</b></div></label>
      </div>

      {isVehicle && <div className="listingFormSection eventFields">
        <div className="formSectionTitle"><span>🚗</span><div><h2>{fr ? "Informations véhicule" : "Vehicle details"}</h2><p>{fr ? "Ajoutez le kilométrage pour aider les acheteurs à comparer les véhicules." : "Add the mileage to help buyers compare vehicles."}</p></div></div>
        <label><span>{fr ? "Kilométrage" : "Mileage"}</span><div className="priceField"><div><input name="vehicleMileage" type="number" min="0" max="5000000" step="1" placeholder="85000" /><b>km</b></div></div></label>
      </div>}

      {isEvent && <div className="listingFormSection eventFields">
        <div className="formSectionTitle"><span>📅</span><div><h2>{fr ? "Détails de l’événement" : "Event details"}</h2><p>{fr ? "Les dates sont enregistrées avec l’événement pour rester synchronisées partout sur Antilles Market." : "The dates are stored with the event so they stay synchronized across Antilles Market."}</p></div></div>
        <div className="formTwoCols"><label><span>{fr ? "Date et heure de début *" : "Start date and time *"}</span><input name="eventStartAt" type="datetime-local" required /></label><label><span>{fr ? "Date et heure de fin *" : "End date and time *"}</span><input name="eventEndAt" type="datetime-local" required /></label></div>
        <div className="formTwoCols"><label><span>{fr ? "Lieu / salle" : "Venue"}</span><input name="eventVenue" maxLength={160} /></label><label><span>{fr ? "Organisateur" : "Organizer"}</span><input name="eventOrganizer" maxLength={120} /></label></div>
        <div className="formTwoCols"><label><span>{fr ? "Lien / billetterie" : "Link / ticketing"}</span><input name="eventUrl" type="url" placeholder="https://..." /></label><label><span>{fr ? "Capacité" : "Capacity"}</span><input name="eventCapacity" type="number" min="1" step="1" /></label></div>
        <label><input name="eventIsFree" type="checkbox" /> {fr ? "Événement gratuit" : "Free event"}</label>
      </div>}

      <label className="fullField"><span>{fr ? "Description *" : "Description *"}</span><textarea name="description" minLength={20} maxLength={5000} rows={9} required /><small>{fr ? "20 caractères minimum. Ne partagez pas d’informations sensibles." : "20 characters minimum. Do not share sensitive information."}</small></label>
    </div>

    <div className="listingFormSection">
      <div className="formSectionTitle"><span>2</span><div><h2>{fr ? "Photos / affiche" : "Photos / poster"}</h2><p>{fr ? "Ajoutez jusqu’à 8 images. La première sera l’image principale." : "Add up to 8 images. The first one will be the main image."}</p></div></div>
      <label className="photoDropPlaceholder photoUploadInput"><strong>📷 {fr ? "Ajouter des photos" : "Add photos"}</strong><span>JPG, PNG or WebP · 10 MB max</span><span className="photoCount">{photoCount ? (fr ? `${photoCount} photo${photoCount > 1 ? "s" : ""} sélectionnée${photoCount > 1 ? "s" : ""}` : `${photoCount} photo${photoCount > 1 ? "s" : ""} selected`) : (fr ? "Aucune photo sélectionnée" : "No photo selected")}</span><input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { const count = e.target.files?.length ?? 0; if (count > 8) { setError(fr ? "Vous pouvez sélectionner 8 photos maximum." : "You can select up to 8 photos."); e.target.value = ""; setPhotoCount(0); return; } setError(""); setPhotoCount(count); }} /></label>
    </div>

    {error && <div className="authError" role="alert">{error}</div>}
    <div className="listingFormActions"><a href="/" className="secondaryButton">{fr ? "Annuler" : "Cancel"}</a><button className="authSubmit" type="submit" disabled={loading}>{loading ? (fr ? "Publication…" : "Publishing…") : (fr ? "Publier mon annonce" : "Publish my listing")}</button></div>
  </form>;
}
