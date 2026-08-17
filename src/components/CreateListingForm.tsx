"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Territory = { id: string; name: string; currency: string };
type Category = { id: string; name: string; slug: string; icon?: string | null; parentId?: string | null; parent?: { name: string; slug: string } | null };
type Location = { id: string; name: string; territoryId: string };
type PhotoItem = { id: string; file: File; preview: string };
type ReviewData = {
  title: string;
  category: string;
  territory: string;
  location: string;
  price: string;
  description: string;
  mileage?: string;
  eventStart?: string;
  eventEnd?: string;
  eventVenue?: string;
  eventOrganizer?: string;
  eventCapacity?: string;
  eventUrl?: string;
  freeEvent?: boolean;
};

export default function CreateListingForm({ territories, categories, locations, locale }: { territories: Territory[]; categories: Category[]; locations: Location[]; locale: "fr" | "en" }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fr = locale === "fr";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [territoryId, setTerritoryId] = useState(territories[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [review, setReview] = useState<ReviewData | null>(null);

  const currency = useMemo(() => territories.find((i) => i.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);
  const availableLocations = useMemo(() => locations.filter((i) => i.territoryId === territoryId), [locations, territoryId]);
  const parents = categories.filter((i) => !i.parentId);
  const children = categories.filter((i) => i.parentId);
  const selected = categories.find((i) => i.id === categoryId);
  const isEvent = selected?.slug.startsWith("evenements-sorties") || selected?.parent?.slug === "evenements-sorties";
  const isVehicle = selected?.slug.startsWith("vehicules") || selected?.parent?.slug === "vehicules";

  function field(name: string) {
    return formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  }

  function validateDetails() {
    setError("");
    const requiredNames = ["title", "categoryId", "territoryId", "price", "description"];
    if (isEvent) requiredNames.push("eventStartAt", "eventEndAt");

    for (const name of requiredNames) {
      const current = field(name);
      if (current && !current.reportValidity()) return false;
    }

    if (isVehicle) {
      const mileage = field("vehicleMileage");
      if (mileage && !mileage.reportValidity()) return false;
    }

    if (isEvent) {
      for (const name of ["eventUrl", "eventCapacity"]) {
        const current = field(name);
        if (current && !current.reportValidity()) return false;
      }
      const start = field("eventStartAt") as HTMLInputElement | null;
      const end = field("eventEndAt") as HTMLInputElement | null;
      if (end) end.setCustomValidity("");
      if (start?.value && end?.value && new Date(end.value).getTime() <= new Date(start.value).getTime()) {
        end.setCustomValidity(fr ? "La date de fin doit être après la date de début." : "The end date must be after the start date.");
        end.reportValidity();
        return false;
      }
    }
    return true;
  }

  function buildReview(): ReviewData {
    const form = formRef.current ? new FormData(formRef.current) : new FormData();
    const chosenCategory = categories.find((item) => item.id === String(form.get("categoryId") ?? ""));
    const chosenTerritory = territories.find((item) => item.id === String(form.get("territoryId") ?? ""));
    const chosenLocation = locations.find((item) => item.id === String(form.get("locationId") ?? ""));
    const rawPrice = Number(String(form.get("price") ?? "0").replace(",", "."));
    const freeEvent = form.get("eventIsFree") === "on";
    const formattedPrice = freeEvent
      ? (fr ? "Gratuit" : "Free")
      : new Intl.NumberFormat(fr ? "fr-FR" : "en-US", { style: "currency", currency: chosenTerritory?.currency ?? currency, maximumFractionDigits: 2 }).format(Number.isFinite(rawPrice) ? rawPrice : 0);

    const formatDate = (value: FormDataEntryValue | null) => {
      const text = String(value ?? "");
      if (!text) return "";
      const date = new Date(text);
      return Number.isNaN(date.getTime()) ? text : new Intl.DateTimeFormat(fr ? "fr-FR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
    };

    return {
      title: String(form.get("title") ?? ""),
      category: chosenCategory?.name ?? "—",
      territory: chosenTerritory?.name ?? "—",
      location: chosenLocation?.name ?? (fr ? "Toute l’île / non précisé" : "Whole island / not specified"),
      price: formattedPrice,
      description: String(form.get("description") ?? ""),
      mileage: isVehicle && form.get("vehicleMileage") ? `${new Intl.NumberFormat(fr ? "fr-FR" : "en-US").format(Number(form.get("vehicleMileage")))} km` : undefined,
      eventStart: isEvent ? formatDate(form.get("eventStartAt")) : undefined,
      eventEnd: isEvent ? formatDate(form.get("eventEndAt")) : undefined,
      eventVenue: isEvent ? String(form.get("eventVenue") ?? "") || undefined : undefined,
      eventOrganizer: isEvent ? String(form.get("eventOrganizer") ?? "") || undefined : undefined,
      eventCapacity: isEvent && form.get("eventCapacity") ? String(form.get("eventCapacity")) : undefined,
      eventUrl: isEvent ? String(form.get("eventUrl") ?? "") || undefined : undefined,
      freeEvent,
    };
  }

  function goToStep(target: 1 | 2 | 3) {
    if (target === step) return;
    if (target < step) {
      setError("");
      setStep(target);
      return;
    }
    if (!validateDetails()) {
      setStep(1);
      return;
    }
    if (target === 3) setReview(buildReview());
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files);
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    const invalidType = incoming.find((file) => !allowed.has(file.type));
    if (invalidType) {
      setError(fr ? "Seuls les fichiers JPG, PNG et WebP sont acceptés." : "Only JPG, PNG and WebP files are accepted.");
      return;
    }
    const tooLarge = incoming.find((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setError(fr ? "Chaque photo doit faire 10 Mo maximum." : "Each photo must be 10 MB or smaller.");
      return;
    }
    if (photos.length + incoming.length > 8) {
      setError(fr ? "Vous pouvez sélectionner 8 photos maximum." : "You can select up to 8 photos.");
      return;
    }
    setError("");
    setPhotos((current) => [...current, ...incoming.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`, file, preview: URL.createObjectURL(file) }))]);
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const item = current[index];
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 3) {
      goToStep(step === 1 ? 2 : 3);
      return;
    }
    if (!validateDetails()) {
      setStep(1);
      return;
    }

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

      if (photos.length) {
        const upload = new FormData();
        photos.forEach((photo) => upload.append("photos", photo.file));
        const photoResponse = await fetch(`/api/listings/${data.listing.id}/images`, { method: "POST", body: upload });
        if (!photoResponse.ok) {
          const photoError = await photoResponse.json();
          setError(fr ? `L’annonce a été créée, mais les photos n’ont pas pu être enregistrées : ${photoError.error ?? "erreur inconnue"}` : `The listing was created, but the photos could not be saved: ${photoError.error ?? "unknown error"}`);
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

  return <form ref={formRef} className="listingForm" onSubmit={submit} noValidate>
    <nav className="listingWizardProgress" aria-label={fr ? "Étapes de publication" : "Publishing steps"}>
      {([1, 2, 3] as const).map((number) => {
        const labels = number === 1 ? [fr ? "Détails" : "Details", fr ? "Informations" : "Information"] : number === 2 ? [fr ? "Photos" : "Photos", fr ? "Images" : "Images"] : [fr ? "Publication" : "Publish", fr ? "Vérification" : "Review"];
        return <button type="button" key={number} className={`listingWizardStep ${step === number ? "active" : ""} ${step > number ? "complete" : ""}`} onClick={() => goToStep(number)} aria-current={step === number ? "step" : undefined}>
          <strong>{step > number ? "✓" : number}</strong><span>{labels[0]}<small>{labels[1]}</small></span>
        </button>;
      })}
    </nav>

    <section className={`listingFormSection ${step !== 1 ? "wizardHidden" : ""}`} aria-hidden={step !== 1}>
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
    </section>

    <section className={`listingFormSection ${step !== 2 ? "wizardHidden" : ""}`} aria-hidden={step !== 2}>
      <div className="formSectionTitle"><span>2</span><div><h2>{fr ? "Photos / affiche" : "Photos / poster"}</h2><p>{fr ? "Ajoutez jusqu’à 8 images. Vous pouvez les réorganiser avant de continuer." : "Add up to 8 images. You can reorder them before continuing."}</p></div></div>
      <label className="photoDropPlaceholder photoUploadInput"><strong>📷 {fr ? "Ajouter des photos" : "Add photos"}</strong><span>JPG, PNG or WebP · 10 MB max</span><span className="photoCount">{photos.length ? (fr ? `${photos.length} photo${photos.length > 1 ? "s" : ""} sélectionnée${photos.length > 1 ? "s" : ""}` : `${photos.length} photo${photos.length > 1 ? "s" : ""} selected`) : (fr ? "Aucune photo sélectionnée" : "No photo selected")}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} /></label>

      {photos.length > 0 && <div className="wizardPhotoGrid">{photos.map((photo, index) => <div className="wizardPhotoCard" key={photo.id}>
        <img src={photo.preview} alt={fr ? `Aperçu photo ${index + 1}` : `Photo preview ${index + 1}`} />
        {index === 0 && <span className="wizardPhotoMainBadge">{fr ? "Photo principale" : "Main photo"}</span>}
        <div className="wizardPhotoActions"><button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label={fr ? "Déplacer à gauche" : "Move left"}>←</button><button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} aria-label={fr ? "Déplacer à droite" : "Move right"}>→</button><button type="button" className="remove" onClick={() => removePhoto(index)} aria-label={fr ? "Supprimer la photo" : "Remove photo"}>×</button></div>
      </div>)}</div>}
    </section>

    {step === 3 && <section className="listingFormSection">
      <div className="formSectionTitle"><span>3</span><div><h2>{fr ? "Vérifier et publier" : "Review and publish"}</h2><p>{fr ? "Vérifiez une dernière fois votre annonce avant sa mise en ligne." : "Check your listing one last time before it goes live."}</p></div></div>
      {review && <div className="wizardReview">
        <div className="wizardReviewHero"><small>{review.category}</small><h2>{review.title}</h2><strong>{review.price}</strong></div>
        <div className="wizardReviewGrid">
          <div className="wizardReviewItem"><small>{fr ? "Catégorie" : "Category"}</small><strong>{review.category}</strong></div>
          <div className="wizardReviewItem"><small>{fr ? "Localisation" : "Location"}</small><strong>{review.location}, {review.territory}</strong></div>
          {review.mileage && <div className="wizardReviewItem"><small>{fr ? "Kilométrage" : "Mileage"}</small><strong>{review.mileage}</strong></div>}
          {review.eventStart && <div className="wizardReviewItem"><small>{fr ? "Début" : "Starts"}</small><strong>{review.eventStart}</strong></div>}
          {review.eventEnd && <div className="wizardReviewItem"><small>{fr ? "Fin" : "Ends"}</small><strong>{review.eventEnd}</strong></div>}
          {review.eventVenue && <div className="wizardReviewItem"><small>{fr ? "Lieu" : "Venue"}</small><strong>{review.eventVenue}</strong></div>}
          {review.eventOrganizer && <div className="wizardReviewItem"><small>{fr ? "Organisateur" : "Organizer"}</small><strong>{review.eventOrganizer}</strong></div>}
          {review.eventCapacity && <div className="wizardReviewItem"><small>{fr ? "Capacité" : "Capacity"}</small><strong>{review.eventCapacity}</strong></div>}
          {review.eventUrl && <div className="wizardReviewItem"><small>{fr ? "Lien / billetterie" : "Link / ticketing"}</small><strong>{review.eventUrl}</strong></div>}
        </div>
        <div className="wizardReviewDescription"><small>{fr ? "Description" : "Description"}</small><p>{review.description}</p></div>
        <div><small>{fr ? `Photos (${photos.length})` : `Photos (${photos.length})`}</small>{photos.length ? <div className="wizardReviewPhotos">{photos.map((photo, index) => <img src={photo.preview} alt={fr ? `Photo ${index + 1}` : `Photo ${index + 1}`} key={photo.id} />)}</div> : <div className="wizardReviewEmpty">📷 {fr ? "Aucune photo ajoutée" : "No photos added"}</div>}</div>
      </div>}
    </section>}

    {error && <div className="authError wizardValidationError" role="alert">{error}</div>}

    {step === 1 && <div className="wizardStepActions"><a href="/" className="secondaryButton">{fr ? "Annuler" : "Cancel"}</a><div className="wizardStepActionsRight single"><button className="authSubmit" type="button" onClick={() => goToStep(2)}>{fr ? "Continuer vers les photos" : "Continue to photos"} →</button></div></div>}
    {step === 2 && <div className="wizardStepActions"><div className="wizardStepActionsRight"><button className="secondaryButton" type="button" onClick={() => goToStep(1)}>← {fr ? "Retour" : "Back"}</button><button className="authSubmit" type="button" onClick={() => goToStep(3)}>{fr ? "Continuer" : "Continue"} →</button></div></div>}
    {step === 3 && <div className="wizardStepActions"><div className="wizardStepActionsRight"><button className="secondaryButton" type="button" onClick={() => goToStep(2)}>← {fr ? "Retour" : "Back"}</button><button className="authSubmit" type="submit" disabled={loading}>{loading ? (fr ? "Publication…" : "Publishing…") : (fr ? "Publier mon annonce" : "Publish my listing")}</button></div></div>}
  </form>;
}
