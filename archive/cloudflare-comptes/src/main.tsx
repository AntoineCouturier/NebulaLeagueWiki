import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import parse from 'html-react-parser';
import { mountAccount } from './account';
import { mountAdministration } from './admin';
import './types';

interface Page { markup: string; scripts: { src?: string; code?: string }[] }
const description = document.getElementById('nebula-page');
if (!description?.textContent) throw Error('Page Nebula manquante.');
const page: Page = JSON.parse(description.textContent);
// Trusted repository markup only. Existing league interactions retain their DOM
// contracts during migration; navigation reloads the page to isolate old globals.
flushSync(() => createRoot(document.getElementById('root')!).render(<>{parse(page.markup)}</>));

async function start() {
  const response = await fetch('/api/league', { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error('La base de la ligue est indisponible.');
  window.NEBULA_BOOTSTRAP = await response.json();
  for (const item of page.scripts) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script'); script.async = false;
      if (item.src) { script.src = item.src; script.onload = () => resolve(); script.onerror = () => reject(Error(`Ressource indisponible : ${item.src}`)); }
      else script.textContent = item.code || '';
      document.body.append(script);
      if (!item.src) resolve();
    });
  }
  document.dispatchEvent(new Event('DOMContentLoaded'));
  mountAccount();
  mountAdministration();
}
void start().catch(() => {
  const notice = document.createElement('p'); notice.className = 'account-notice'; notice.setAttribute('role', 'alert');
  notice.textContent = 'Les données de la ligue sont indisponibles. Recharge la page dans un instant.';
  document.querySelector('main')?.prepend(notice);
});
