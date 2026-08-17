"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency?: string };
type Category = { id: string; name: string; slug: string; icon?: string | null; parentId?: string | null; parent?: { slug: string } | null };
type Location = { id: string; name: string; territoryId: string };
type ExistingImage = { id: string; url: string };
type NewPhoto = { id: string; file: File; preview: string };
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
  images: ExistingImage[];
};

export default function EditListingForm({ listing, territories, categories, locations, locale }: { listing: ListingData; territories: Territory[]; categories: Category[]; locations: Location[]; locale: "fr" | "en" }) {
  const router = useRouter();
  const fr = locale === "fr";
  const [territoryId, setTerritoryId] = useState(listing.territoryId);
  const [locationId, setLocationId] = useState(listing.locationId ?? "");
  const [categoryId, setCategoryId] = useState(listing.categoryId);
  const [eventIsFree, setEventIsFree] = useState(listing.eventIsFree);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(listing.images);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const availableLocations = useMemo(() => locations.filter((item) => item.territoryId === territoryId), [locations, territoryId]);
  const selected = categories.find((item) => item.id === categoryId);
  const isVehicle = selected?.slug.startsWith("vehicules") || selected?.parent?.slug === "vehicules";
  const isEvent = selected?.slug.startsWith("evenements-sorties") || selected?.parent?.slug === "evenements-sorties";
  const photoCount = existingImages.length + newPhotos.length;

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files);
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (incoming.some((file) => !allowed.has(file.type))) {
      setError(fr ? "Seuls les fichiers JPG, PNG et WebP sont acceptés." : "Only JPG, PNG and WebP files are accepted.");
      return;
    }
    if (incoming.some((file) => file.size > 10 * 1024 * 1024)) {
      setError(fr ? "Chaque photo doit faire 10 Mo maximum." : "Each photo must be 10 MB or smaller.");
      return;
    }
    if (photoCount + incoming.length > 8) {
      setError(fr ? "Vous pouvez conserver 8 photos maximum par annonce." : "You can keep up to 8 photos per listing.");
      return;
    }
    setError("");
    setNewPhotos((current) => [...current, ...incoming.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`, file, preview: URL.createObjectURL(file) }))]);
  }

  function removeExisting(index: number) {
    const image = existingImages[index];
    if (!image) return;
    setDeletedImageIds((current) => [...current, image.id]);
    setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  function moveExisting(index: number, direction: -1 | 1) {
    setExistingImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((current) => {
      const photo = current[index];
      if (photo) URL.revokeObjectURL(photo.preview);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
  }

  function moveNewPhoto(index: number, direction: -1 | 1) {
    setNewPhotos((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

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

      for (const imageId of deletedImageIds) {
        const deleteResponse = await fetch(`/api/listings/${listing.id}/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        });
        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          const imageError = await deleteResponse.json();
          setError(imageError.error ?? (fr ? "Les informations ont été enregistrées, mais une photo n’a pas pu être supprimée." : "The listing details were saved, but a photo could not be deleted."));
          return;
        }
      }

      const reorderResponse = await fetch(`/api/listings/${listing.id}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: existingImages.map((image) => image.id) }),
      });
      if (!reorderResponse.ok) {
        const imageError = await reorderResponse.json();
        setError(imageError.error ?? (fr ? "Les informations ont été enregistrées, mais les photos n’ont pas pu être réorganisées." : "The listing details were saved, but the photos could not be reordered."));
        return;
      }

      if (newPhotos.length) {
        const upload = new FormData();
        newPhotos.forEach((photo) => upload.append("photos", photo.file));
        const uploadResponse = await fetch(`/api/listings/${listing.id}/images`, { method: "POST", body: upload });
        if (!uploadResponse.ok) {
          const imageError = await uploadResponse.json();
          setError(imageError.error ?? (fr ? "Les informations ont été enregistrées, mais les nouvelles photos n’ont pas pu être ajoutées." : "The listing details were saved, but the new photos could not be added."));
          return;
        }
      }

      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
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

    <div className="listingFormSection">
      <div className="formSectionTitle"><span>📷</span><div><h2>{fr ? "Photos" : "Photos"}</h2><p>{fr ? "Supprimez, réorganisez ou ajoutez des photos. Les modifications seront appliquées lorsque vous enregistrez l’annonce." : "Remove, reorder or add photos. Changes are applied when you save the listing."}</p></div></div>
      {existingImages.length > 0 && <div className="wizardPhotoGrid">{existingImages.map((image, index) => <div className="wizardPhotoCard" key={image.id}>
        <img src={image.url} alt={fr ? `Photo actuelle ${index + 1}` : `Current photo ${index + 1}`} />
        {index === 0 && <span className="wizardPhotoMainBadge">{fr ? "Photo principale" : "Main photo"}</span>}
        <div className="wizardPhotoActions"><button type="button" onClick={() => moveExisting(index, -1)} disabled={index === 0 || loading} aria-label={fr ? "Déplacer à gauche" : "Move left"}>←</button><button type="button" onClick={() => moveExisting(index, 1)} disabled={index === existingImages.length - 1 || loading} aria-label={fr ? "Déplacer à droite" : "Move right"}>→</button><button type="button" className="remove" onClick={() => removeExisting(index)} disabled={loading} aria-label={fr ? "Supprimer la photo" : "Remove photo"}>×</button></div>
      </div>)}</div>}

      {newPhotos.length > 0 && <><small>{fr ? "Nouvelles photos" : "New photos"}</small><div className="wizardPhotoGrid">{newPhotos.map((photo, index) => <div className="wizardPhotoCard" key={photo.id}>
        <img src={photo.preview} alt={fr ? `Nouvelle photo ${index + 1}` : `New photo ${index + 1}`} />
        <div className="wizardPhotoActions"><button type="button" onClick={() => moveNewPhoto(index, -1)} disabled={index === 0 || loading} aria-label={fr ? "Déplacer à gauche" : "Move left"}>←</button><button type="button" onClick={() => moveNewPhoto(index, 1)} disabled={index === newPhotos.length - 1 || loading} aria-label={fr ? "Déplacer à droite" : "Move right"}>→</button><button type="button" className="remove" onClick={() => removeNewPhoto(index)} disabled={loading} aria-label={fr ? "Supprimer la photo" : "Remove photo"}>×</button></div>
      </div>)}</div></>}

      {photoCount < 8 && <label className="photoDropPlaceholder photoUploadInput"><strong>📷 {fr ? "Ajouter des photos" : "Add photos"}</strong><span>JPG, PNG or WebP · 10 MB max</span><span className="photoCount">{fr ? `${photoCount}/8 photo${photoCount > 1 ? "s" : ""}` : `${photoCount}/8 photo${photoCount === 1 ? "" : "s"}`}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={loading} onChange={(event) => { addPhotos(event.target.files); event.target.value = ""; }} /></label>}
    </div>

    {error && <div className="authError">{error}</div>}
    <div className="listingFormActions"><a className="secondaryButton" href="/mes-annonces">{fr ? "Annuler" : "Cancel"}</a><button className="authSubmit" disabled={loading}>{loading ? (fr ? "Enregistrement…" : "Saving…") : (fr ? "Enregistrer les modifications" : "Save changes")}</button></div>
  </form>;
}
