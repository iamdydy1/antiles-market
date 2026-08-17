"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency?: string };
type Category = { id: string; name: string; slug: string; icon?: string | null; parentId?: string | null; parent?: { slug: string } | null };
type Location = { id: string; name: string; territoryId: string };
type ListingData = {
  id: string;
  title: string;
  description: string;
  price: string;
  categoryId: string;
  territoryId: string;
  locationId: string | null;
  vehicleMileage: number | null;
  eventStartAt: string;
  eventEndAt: string;
  eventVenue: string | null;
  eventOrganizer: string | null;
  eventUrl: string | null;
  eventCapacity: number | null;
  eventIsFree: boolean;
};

export default function EditListingForm({ listing, territories, categories, locations, locale }: { listing: ListingData; territories: Territory[]; categories: Category[]; locations: Location[]; locale: "fr" | "en" }) {
  const router = useRouter();
  const fr = locale === "fr";
  const [territoryId, setTerritoryId] = useState(listing.territoryId);
  const [locationId, setLocationId] = useState(listing.locationId ?? "");
  const [categoryId, setCategoryId] = useState(listing.categoryId);
  const [eventIsFree, setEventIsFree] = useState(listing.eventIsFree);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const availableLocations = useMemo(() => locations.filter((item) => item.territoryId === territoryId), [locations, territoryId]);
  const selected = categories.find((item) => item.id === categoryId);
  const isVehicle = selected?.slug.startsWith("vehicules") || selected?.parent?.slug === "vehicules";
  const isEvent = selected?.slug.startsWith("evenements-sorties") || selected?.parent?.slug === "evenements-sorties";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const payload: Record<string, unknown> = {
        title: form.get("title"),
        categoryId: form.get("categoryId"),
        territoryId: form.get("territoryId"),
        locationId: form.get("locationId") || null,
        price: form.get("price"),
        description: form.get("description"),
        vehicleMileage: isVehicle ? (form.get("vehicleMileage") || null) : null,
      };
      if (isEvent) {
        payload.eventStartAt = form.get("eventStartAt");
        payload.eventEndAt = form.get("eventEndAt");
        payload.eventVenue = form.get("eventVenue") || null;
        payload.eventOrganizer = form.get("eventOrganizer") || null;
        payload.eventUrl = form.get("eventUrl") || null;
        payload.eventCapacity = form.get("eventCapacity") || null;
        payload.eventIsFree = form.get("eventIsFree") === "on";
      }

      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? (fr ? "Impossible de modifier l’annonce." : "Unable to update the listing."));
        return;
      }
      router.push("/mes-annonces");
      router.refresh();
    } catch {
      setError(fr ? "Impossible de contacter le serveur." : "Unable to contact the server.");
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
        <label><span>{fr ? "Île / territoire" : "Island / territory"}</span><select name="territoryId" value={territoryId} onChange={(event) => { setTerritoryId(event.target.value); setLocationId(""); }}>{territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}</select></label>
      </div>
      <div className="formTwoCols">
        <label><span>{fr ? "Ville / commune" : "City / town"}</span><select name="locationId" value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">{fr ? "Toute l’île / non précisé" : "Whole island / not specified"}</option>{availableLocations.map((location) => <option value={location.id} key={location.id}>{location.name}</option>)}</select></label>
        <label className="priceField"><span>{fr ? "Prix" : "Price"}</span><div><input name="price" type="number" min="0" step="0.01" defaultValue={listing.price} required /><b>{currency}</b></div></label>
      </div>

      {isVehicle && <div className="listingFormSection eventFields">
        <div className="formSectionTitle"><span>🚗</span><div><h2>{fr ? "Informations véhicule" : "Vehicle details"}</h2><p>{fr ? "Mettez à jour le kilométrage si nécessaire." : "Update the mileage when needed."}</p></div></div>
        <label className="priceField"><span>{fr ? "Kilométrage" : "Mileage"}</span><div><input name="vehicleMileage" type="number" min="0" max="5000000" step="1" defaultValue={listing.vehicleMileage ?? ""} placeholder="85000" /><b>km</b></div></label>
      </div>}

      {isEvent && <div className="listingFormSection eventFields">
        <div className="formSectionTitle"><span>📅</span><div><h2>{fr ? "Détails de l’événement" : "Event details"}</h2><p>{fr ? "Gardez les dates et informations de votre événement à jour." : "Keep your event dates and details up to date."}</p></div></div>
        <div className="formTwoCols"><label><span>{fr ? "Date et heure de début *" : "Start date and time *"}</span><input name="eventStartAt" type="datetime-local" defaultValue={listing.eventStartAt} required /></label><label><span>{fr ? "Date et heure de fin *" : "End date and time *"}</span><input name="eventEndAt" type="datetime-local" defaultValue={listing.eventEndAt} required /></label></div>
        <div className="formTwoCols"><label><span>{fr ? "Lieu / salle" : "Venue"}</span><input name="eventVenue" maxLength={160} defaultValue={listing.eventVenue ?? ""} /></label><label><span>{fr ? "Organisateur" : "Organizer"}</span><input name="eventOrganizer" maxLength={120} defaultValue={listing.eventOrganizer ?? ""} /></label></div>
        <div className="formTwoCols"><label><span>{fr ? "Lien / billetterie" : "Link / ticketing"}</span><input name="eventUrl" type="url" placeholder="https://..." defaultValue={listing.eventUrl ?? ""} /></label><label><span>{fr ? "Capacité" : "Capacity"}</span><input name="eventCapacity" type="number" min="1" step="1" defaultValue={listing.eventCapacity ?? ""} /></label></div>
        <label><input name="eventIsFree" type="checkbox" checked={eventIsFree} onChange={(event) => setEventIsFree(event.target.checked)} /> {fr ? "Événement gratuit" : "Free event"}</label>
      </div>}

      <label className="fullField"><span>{fr ? "Description" : "Description"}</span><textarea name="description" rows={10} minLength={20} maxLength={5000} defaultValue={listing.description} required /></label>
    </div>
    {error && <div className="authError">{error}</div>}
    <div className="listingFormActions"><a className="secondaryButton" href="/mes-annonces">{fr ? "Annuler" : "Cancel"}</a><button className="authSubmit" disabled={loading}>{loading ? (fr ? "Enregistrement…" : "Saving…") : (fr ? "Enregistrer les modifications" : "Save changes")}</button></div>
  </form>;
}
