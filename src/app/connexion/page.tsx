import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="authPage">
      <a className="authBrand" href="/">
        <span className="brandMark">AM</span>
        <span>Antilles Market</span>
      </a>

      <section className="authShell">
        <div className="authVisual">
          <span className="authBadge">La marketplace des Antilles</span>
          <h1>Bon retour parmi nous.</h1>
          <p>Retrouvez vos annonces, vos favoris et toutes vos conversations en un seul endroit.</p>
          <div className="authBenefits">
            <span>✓ Messagerie intégrée</span>
            <span>✓ Annonces locales</span>
            <span>✓ Tous les territoires</span>
          </div>
        </div>

        <div className="authPanel">
          <div className="authPanelHead">
            <span className="eyebrow">Connexion</span>
            <h2>Se connecter</h2>
            <p>Accédez à votre espace Antilles Market.</p>
          </div>
          <AuthForm mode="login" />
          <p className="authSwitch">Pas encore de compte ? <a href="/inscription">Créer un compte</a></p>
          <a className="authBack" href="/">← Retour à l’accueil</a>
        </div>
      </section>
    </main>
  );
}
