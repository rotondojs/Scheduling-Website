import type { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Fortnite — fortnite-api.com (no API key required, key optional for higher rate limits)
// ---------------------------------------------------------------------------

const FortniteQuerySchema = z.object({
  username: z.string().min(1),
  platform: z.enum(["epic", "psn", "xbl"]).default("epic"),
  timeWindow: z.enum(["season", "lifetime"]).default("lifetime"),
});

export async function getFortniteStats(req: Request, res: Response) {
  const parsed = FortniteQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { username, platform, timeWindow } = parsed.data;

  try {
    const headers: Record<string, string> = {};
    if (process.env.FORTNITE_API_KEY) {
      headers["Authorization"] = process.env.FORTNITE_API_KEY;
    }

    const url = new URL("https://fortnite-api.com/v2/stats/br/v2");
    url.searchParams.set("name", username);
    url.searchParams.set("accountType", platform);
    url.searchParams.set("timeWindow", timeWindow);
    url.searchParams.set("image", "none");

    const response = await fetch(url.toString(), { headers });
    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return res.status(response.status).json({
        error: (body as { error?: string }).error ?? "Player not found",
      });
    }

    res.json(body);
  } catch {
    res.status(500).json({ error: "Failed to reach Fortnite API" });
  }
}

// ---------------------------------------------------------------------------
// Steam — api.steampowered.com (free API key required)
// Get a key at: https://steamcommunity.com/dev/apikey
// Add STEAM_API_KEY to server/.env
// ---------------------------------------------------------------------------

const SteamQuerySchema = z.object({
  steamId: z.string().min(1),
});

export async function getSteamStats(req: Request, res: Response) {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        "Steam API key not configured. Get a free key at https://steamcommunity.com/dev/apikey and add STEAM_API_KEY=your_key to server/.env",
    });
  }

  const parsed = SteamQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { steamId } = parsed.data;

  try {
    const url = new URL(
      "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
    );
    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamids", steamId);

    const response = await fetch(url.toString());
    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return res.status(response.status).json({ error: "Steam API error" });
    }

    res.json(body);
  } catch {
    res.status(500).json({ error: "Failed to reach Steam API" });
  }
}

// ---------------------------------------------------------------------------
// Apex Legends — api.mozambiquehe.re (free API key required)
// Get a free key at: https://apexlegendsapi.com
// Add APEX_API_KEY to server/.env
// ---------------------------------------------------------------------------

const ApexQuerySchema = z.object({
  username: z.string().min(1),
  platform: z.enum(["PC", "PS4", "X1", "SWITCH"]).default("PC"),
});

export async function getApexStats(req: Request, res: Response) {
  const apiKey = process.env.APEX_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        "Apex API key not configured. Get a free key at https://apexlegendsapi.com and add APEX_API_KEY=your_key to server/.env",
    });
  }

  const parsed = ApexQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { username, platform } = parsed.data;

  try {
    const url = new URL("https://api.mozambiquehe.re/bridge");
    url.searchParams.set("auth", apiKey);
    url.searchParams.set("player", username);
    url.searchParams.set("platform", platform);

    const response = await fetch(url.toString());
    const body = (await response.json()) as Record<string, unknown>;

    if ((body as { Error?: string }).Error) {
      return res.status(404).json({ error: (body as { Error: string }).Error });
    }

    res.json(body);
  } catch {
    res.status(500).json({ error: "Failed to reach Apex Legends API" });
  }
}
