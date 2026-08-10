"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string; icon?: string | null; currency?: string };

export default function CreateListingForm({ territories, categories }: { territories: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [territoryId, setTerritoryId] = useState(territories[0]?.id ?? "");
  const currency = useMemo(() => territories.find((item) => item.id === territoryId)?.currency ?? "EUR", [territories, territoryId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
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
        setError(data.error ?? "Impossible de publier l’annonce.");
        return;
      }
      router.push(`/annonces/${data.listing.slug}`);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="listingForm" onSubmit={submit}>
      <div className="listingFormSection">
        <div className="formSectionTitle"><span>1</span><div><h2>Informations générales</h2><p>Décrivez clairement ce que vous proposez.</p></div></div>

        <label className="fullField">
          <span>Titre de l’annonce *</span>
          <input name="title" minLength={5} maxLength={120} placeholder="Ex. Renault Clio 2018 très bon état" required />
        </label>

        <div className="formTwoCols">
          <label>
            <span>Catégorie *</span>
            <select name="categoryId" required defaultValue="">
              <option value="" disabled>Sélectionnez une catégorie</option>
              {categories.map((category) => <option value={category.id} key={category.id}>{category.icon} {category.name}</option>)}
            </select>
          </label>
          <label>
            <span>Île / territoire *</span>
            <select name="territoryId" required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)}>
              {territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}
            </select>
          </label>
        </div>

        <label className="priceField">
          <span>Prix *</span>
          <div><input name="price" type="number" min="0" step="0.01" placeholder="0" required /><b>{currency}</b></div>
        </label>

        <label className="fullField">
          <span>Description *</span>
          <textarea name="description" minLength={20} maxLength={5000} rows={9} placeholder="État, caractéristiques, conditions de vente, informations utiles…" required />
          <small>20 caractères minimum. Ne partagez pas d’informations sensibles.</small>
        </label>
      </div>

      <div className="listingFormSection photoStepPreview">
        <div className="formSectionTitle"><span>2</span><div><h2>Photos</h2><p>Les photos seront ajoutées dans la prochaine étape du développement.</p></div></div>
        <div className="photoDropPlaceholder"><strong>📷 Photos de l’annonce</strong><span>Jusqu’à plusieurs photos, avec une photo principale.</span></div>
      </div>

      {error && <div className="authError" role="alert">{error}</div>}

      <div className="listingFormActions">
        <a href="/" className="secondaryButton">Annuler</a>
        <button className="authSubmit" type="submit" disabled={loading}>{loading ? "Publication…" : "Publier mon annonce"}</button>
      </div>
    </form>
  );
}
