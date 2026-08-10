import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="authPage">
      <a className="authBrand" href="/">
        <span className="brandMark">AM</span>
        <span>Antilles Market</span>
      </a>

      <section className="authShell">
        <div className="authVisual authVisualRegister">
          <span className="authBadge">Simple · Local · Direct</span>
          <h1>Votre île. Vos annonces. Votre communauté.</h1>
          <p>Créez gratuitement votre compte pour vendre, acheter et discuter directement avec les personnes près de chez vous.</p>
          <div className="authBenefits">
            <span>✓ Publication rapide</span>
            <span>✓ Favoris synchronisés</span>
            <span>✓ Chat privé entre membres</span>
          </div>
        </div>

        <div className="authPanel">
          <div className="authPanelHead">
            <span className="eyebrow">Bienvenue</span>
            <h2>Créer un compte</h2>
            <p>Rejoignez Antilles Market gratuitement.</p>
          </div>
          <AuthForm mode="register" />
          <p className="authSwitch">Vous avez déjà un compte ? <a href="/connexion">Se connecter</a></p>
          <a className="authBack" href="/">← Retour à l’accueil</a>
        </div>
      </section>
    </main>
  );
}
