import AuthForm from "@/components/AuthForm";
import { getLocale } from "@/lib/i18n";

export default async function RegisterPage() {
  const locale = await getLocale();
  const en = locale === "en";
  return (
    <main className="authPage">
      <a className="authBrand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a>
      <section className="authShell">
        <div className="authVisual authVisualRegister">
          <span className="authBadge">{en ? "Simple · Local · Direct" : "Simple · Local · Direct"}</span>
          <h1>{en ? "Your island. Your listings. Your community." : "Votre île. Vos annonces. Votre communauté."}</h1>
          <p>{en ? "Create your free account to sell, buy and chat directly with people near you." : "Créez gratuitement votre compte pour vendre, acheter et discuter directement avec les personnes près de chez vous."}</p>
          <div className="authBenefits"><span>✓ {en ? "Fast publishing" : "Publication rapide"}</span><span>✓ {en ? "Synced favorites" : "Favoris synchronisés"}</span><span>✓ {en ? "Private member chat" : "Chat privé entre membres"}</span></div>
        </div>
        <div className="authPanel">
          <div className="authPanelHead"><span className="eyebrow">{en ? "Welcome" : "Bienvenue"}</span><h2>{en ? "Create an account" : "Créer un compte"}</h2><p>{en ? "Join Antilles Market for free." : "Rejoignez Antilles Market gratuitement."}</p></div>
          <AuthForm mode="register" locale={locale} />
          <p className="authSwitch">{en ? "Already have an account? " : "Vous avez déjà un compte ? "}<a href="/connexion">{en ? "Sign in" : "Se connecter"}</a></p>
          <a className="authBack" href="/">← {en ? "Back to home" : "Retour à l’accueil"}</a>
        </div>
      </section>
    </main>
  );
}
