import AuthForm from "@/components/AuthForm";
import { getLocale } from "@/lib/i18n";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const [locale, raw] = await Promise.all([getLocale(), searchParams]);
  const en = locale === "en";
  const requestedNext = one(raw.next) ?? "/compte";
  const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/compte";

  return (
    <main className="authPage">
      <a className="authBrand" href="/">
        <span className="brandMark">AM</span>
        <span>Antilles Market</span>
      </a>

      <section className="authShell">
        <div className="authVisual">
          <span className="authBadge">{en ? "The Caribbean marketplace" : "La marketplace des Antilles"}</span>
          <h1>{en ? "Welcome back." : "Bon retour parmi nous."}</h1>
          <p>{en ? "Find your listings, favorites and conversations all in one place." : "Retrouvez vos annonces, vos favoris et toutes vos conversations en un seul endroit."}</p>
          <div className="authBenefits">
            <span>✓ {en ? "Built-in messaging" : "Messagerie intégrée"}</span>
            <span>✓ {en ? "Local listings" : "Annonces locales"}</span>
            <span>✓ {en ? "All territories" : "Tous les territoires"}</span>
          </div>
        </div>

        <div className="authPanel">
          <div className="authPanelHead">
            <span className="eyebrow">{en ? "Sign in" : "Connexion"}</span>
            <h2>{en ? "Sign in" : "Se connecter"}</h2>
            <p>{en ? "Access your Antilles Market account." : "Accédez à votre espace Antilles Market."}</p>
          </div>
          <AuthForm mode="login" locale={locale} nextPath={nextPath} />
          <p className="authSwitch">{en ? "No account yet? " : "Pas encore de compte ? "}<a href="/inscription">{en ? "Create an account" : "Créer un compte"}</a></p>
          <a className="authBack" href="/">← {en ? "Back to home" : "Retour à l’accueil"}</a>
        </div>
      </section>
    </main>
  );
}
