import { useState } from "react";
import axios from "axios";

export type GameKey = "fortnite" | "steam" | "apex";

// --- Fortnite types ---

export interface FortniteStatSet {
  wins: number;
  kills: number;
  kd: number;
  matches: number;
  winRate: number;
  minutesPlayed: number;
  killsPerMatch: number;
  playersOutlived: number;
}

export interface FortniteData {
  account: { id: string; name: string };
  stats: {
    all: {
      overall: FortniteStatSet;
      solo?: FortniteStatSet;
      duo?: FortniteStatSet;
      trio?: FortniteStatSet;
      squad?: FortniteStatSet;
    };
  };
}

// --- Steam types ---

export interface SteamPlayer {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  personastate: number;
  timecreated?: number;
  loccountrycode?: string;
  gameextrainfo?: string;
}

export interface SteamData {
  response: { players: SteamPlayer[] };
}

// --- Apex types ---

export interface ApexData {
  global: {
    name: string;
    uid: number;
    platform: string;
    level: { value: number; intValue: number };
    rank: {
      rankScore: number;
      rankName: string;
      rankDiv: number;
      ladderPosPlatform: number;
      rankImg: string;
    };
    battlepass: { level: { value: number } };
    toNextLevelPercent: number;
  };
  legends: {
    selected: {
      LegendName: string;
      data?: Array<{ name: string; value: number; key: string }>;
      gameInfo?: { skin: string };
    };
  };
  total: Record<string, { name: string; value: number }>;
}

// --- Hook ---

const api = axios.create({ baseURL: "/api" });

export function useGameStats() {
  const [game, setGameState] = useState<GameKey>("fortnite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FortniteData | SteamData | ApexData | null>(null);
  const [searched, setSearched] = useState(false);

  function setGame(g: GameKey) {
    setGameState(g);
    setData(null);
    setError(null);
    setSearched(false);
  }

  async function search(params: Record<string, string>) {
    setLoading(true);
    setError(null);
    setData(null);
    setSearched(true);
    try {
      const { data: result } = await api.get(`/stats/${game}`, { params });
      // fortnite-api wraps data in a `data` key; steam and apex return top-level
      setData((result.data ?? result) as FortniteData | SteamData | ApexData);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(
          (e.response?.data as { error?: string })?.error ?? "Failed to load stats.",
        );
      } else {
        setError("Failed to load stats.");
      }
    } finally {
      setLoading(false);
    }
  }

  return { game, setGame, loading, error, data, searched, search };
}
