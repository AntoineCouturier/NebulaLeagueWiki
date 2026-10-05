export interface DiscordUser { id: string; name: string; avatar: string }
export interface Session { available: boolean; user: DiscordUser | null; admin?: boolean }
export interface Player { name: string; discordId?: string; href: string }
declare global {
  interface Window {
    NEBULA_BOOTSTRAP?: Record<string, unknown>;
    NEBULA_DATA?: { players: Player[]; pageUrl: (path: string) => string };
  }
}
