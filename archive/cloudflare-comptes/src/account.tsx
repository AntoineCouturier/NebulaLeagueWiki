import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import type { Session } from './types';

const errors: Record<string, string> = {
  unavailable: 'La connexion Discord n’est pas encore activée.',
  state: 'Cette demande a expiré. Relance la connexion depuis cette page.',
  cancelled: 'La connexion a été annulée.',
  discord: 'La connexion n’a pas pu aboutir. Réessaie dans un instant.'
};
function Account({ session, refresh }: { session: Session | null; refresh: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  if (!session) return <p>Vérification de la connexion…</p>;
  const user = session.user;
  const player = user && window.NEBULA_DATA?.players.find(p => p.discordId === user.id);
  async function logout() {
    setBusy(true); setFailure('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error();
      await refresh();
    } catch { setFailure('La déconnexion a échoué. Réessaie.'); }
    finally { setBusy(false); }
  }
  return <>
    <span className="account-kicker">DISCORD × NEBULA</span>
    {user ? <>
      <div className="account-identity"><img className="account-avatar" src={user.avatar} alt="" width="80" height="80" /><div><h2>{user.name}</h2><p>Connecté avec Discord</p></div></div>
      {player ? <a className="account-primary" href={player.href}>Ouvrir ma fiche joueur ↗</a> : <p className="account-notice">Ton compte n’est pas encore associé à une fiche. Contacte un organisateur pour faire vérifier ton identité.</p>}
      {session.admin && <a className="account-primary" href="/admin.html">Administrer la ligue ↗</a>}
      <button className="account-logout" type="button" disabled={busy} onClick={logout}>{busy ? 'Déconnexion…' : 'Se déconnecter'}</button>
    </> : <>
      <h2>TON COMPTE. TA FICHE.</h2><p>Connecte ton compte Discord pour retrouver directement ton profil dans la ligue.</p>
      {session.available ? <><a className="account-primary" href="/api/auth/login">Se connecter avec Discord ↗</a><p className="account-note">Seuls ton identité et ton avatar Discord sont demandés.</p></> : <p className="account-notice">La connexion sera disponible dès son activation sur l’hébergement du site.</p>}
    </>}
    {failure && <p role="alert">{failure}</p>}
  </>;
}
function Connection({ panel }: { panel: HTMLElement | null }) {
  const [session, setSession] = useState<Session | null>(null);
  const [failure, setFailure] = useState(false);
  async function refresh() {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error();
      setSession(await response.json()); setFailure(false);
    } catch { setFailure(true); }
  }
  useEffect(() => {
    void refresh();
    const update = () => { void refresh(); };
    window.addEventListener('focus', update); window.addEventListener('pageshow', update);
    return () => { window.removeEventListener('focus', update); window.removeEventListener('pageshow', update); };
  }, []);
  return <><a className="auth-link" href="/compte.html" aria-label={session?.user ? 'Mon compte Discord' : 'Connexion avec Discord'}>{session?.user ? 'Mon compte' : 'Connexion'}</a>{panel && createPortal(failure ? <p role="alert">Impossible de vérifier la connexion. <button onClick={() => void refresh()}>Réessayer</button></p> : <Account session={session} refresh={refresh} />, panel)}</>;
}
export function mountAccount() {
  const panel = document.getElementById('accountPanel');
  panel?.replaceChildren();
  const actions = document.querySelector('.header-actions');
  const slot = document.createElement('span'); slot.style.display = 'contents';
  actions?.insertBefore(slot, actions.querySelector('.menu-button'));
  if (actions) createRoot(slot).render(<Connection panel={panel} />);
  const feedback = document.getElementById('accountFeedback');
  const error = new URLSearchParams(location.search).get('auth') || '';
  if (feedback && errors[error]) { feedback.textContent = errors[error]; feedback.hidden = false; }
}
