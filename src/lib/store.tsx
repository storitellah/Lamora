/**
 * Lamora app store — one React context backed by localStorage.
 *
 * Everything lives on the device: profiles, stars, settings, usage.
 * There is no server and no network I/O anywhere in this file.
 */
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { setAudioPrefs, startMusic, stopMusic } from "./audio";

/* ---------------- Types ---------------- */

export interface Profile {
  id: string;
  name: string;
  avatar: string;            // emoji avatar
  age: number;               // 5–10, drives difficulty
  stars: number;             // spendable balance (converts to play tokens)
  totalStars: number;        // lifetime, drives milestones
  tokens: number;            // unlocked play sessions
  done: Record<string, number>; // activity-id -> completions
  usage: Record<string, number>; // 'YYYY-MM-DD' -> seconds on screen
}

export interface Settings {
  pin: string | null;
  muted: boolean;
  volume: number;
  musicOn: boolean;
  starsPerToken: number;     // learning needed per unlocked game session
  playMinutes: number;       // length of one reward game session
  dailyLimitMin: number;
  reducedMotion: boolean;
}

export interface AppState {
  profiles: Profile[];
  activeId: string | null;
  settings: Settings;
}

/** Screens are a tiny in-memory router — no URL dependency, works offline
 *  and inside standalone PWAs without history quirks. */
export type Screen =
  | { name: "profiles" }
  | { name: "home" }
  | { name: "reading" } | { name: "math" } | { name: "trivia" }
  | { name: "games" } | { name: "chess" } | { name: "dreamcards" }
  | { name: "rewards" }
  | { name: "parent-gate" } | { name: "parent" }
  | { name: "break" };

/* ---------------- Defaults ---------------- */

const KEY = "lamora-v2";

function makeProfile(name: string, age: number, avatar: string): Profile {
  return {
    id: "p" + Math.random().toString(36).slice(2, 9),
    name, age, avatar,
    stars: 0, totalStars: 0, tokens: 0,
    done: {}, usage: {}
  };
}

function defaults(): AppState {
  return {
    profiles: [
      makeProfile("Luna", 6, "🌙"),
      makeProfile("Lara", 8, "🦋"),
      makeProfile("Arica", 5, "🌸")
    ],
    activeId: null,
    settings: {
      pin: null,
      muted: false,
      volume: 0.7,
      musicOn: false,
      starsPerToken: 5,
      playMinutes: 5,
      dailyLimitMin: 45,
      reducedMotion: false
    }
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      s.settings = { ...defaults().settings, ...s.settings };
      return s;
    }
  } catch { /* corrupted store — start fresh */ }
  return defaults();
}

/* ---------------- Reducer ---------------- */

type Action =
  | { type: "select"; id: string | null }
  | { type: "award"; stars: number; activity: string }
  | { type: "spendToken" }
  | { type: "tickUsage"; seconds: number }
  | { type: "resetToday" }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "profile"; id: string; patch: Partial<Profile> }
  | { type: "addProfile" }
  | { type: "removeProfile"; id: string }
  | { type: "resetRewards"; id: string }
  | { type: "wipe" };

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function reducer(state: AppState, a: Action): AppState {
  const withActive = (fn: (p: Profile) => Profile): AppState => ({
    ...state,
    profiles: state.profiles.map(p => (p.id === state.activeId ? fn({ ...p }) : p))
  });

  switch (a.type) {
    case "select":
      return { ...state, activeId: a.id };
    case "award":
      return withActive(p => {
        p.stars += a.stars;
        p.totalStars += a.stars;
        p.done = { ...p.done, [a.activity]: (p.done[a.activity] ?? 0) + 1 };
        // Learning converts into play: every N stars grants one game token.
        const per = state.settings.starsPerToken;
        while (p.stars >= per) { p.stars -= per; p.tokens += 1; }
        return p;
      });
    case "spendToken":
      return withActive(p => ({ ...p, tokens: Math.max(0, p.tokens - 1) }));
    case "tickUsage":
      return withActive(p => ({
        ...p,
        usage: { ...p.usage, [todayKey()]: (p.usage[todayKey()] ?? 0) + a.seconds }
      }));
    case "resetToday":
      return withActive(p => ({ ...p, usage: { ...p.usage, [todayKey()]: 0 } }));
    case "settings":
      return { ...state, settings: { ...state.settings, ...a.patch } };
    case "profile":
      return {
        ...state,
        profiles: state.profiles.map(p => (p.id === a.id ? { ...p, ...a.patch } : p))
      };
    case "addProfile":
      if (state.profiles.length >= 6) return state;
      return { ...state, profiles: [...state.profiles, makeProfile("New friend", 6, "⭐")] };
    case "removeProfile":
      if (state.profiles.length <= 1) return state;
      return {
        ...state,
        activeId: state.activeId === a.id ? null : state.activeId,
        profiles: state.profiles.filter(p => p.id !== a.id)
      };
    case "resetRewards":
      return {
        ...state,
        profiles: state.profiles.map(p =>
          p.id === a.id ? { ...p, stars: 0, totalStars: 0, tokens: 0, done: {} } : p
        )
      };
    case "wipe":
      return defaults();
    default:
      return state;
  }
}

/* ---------------- Context ---------------- */

interface Store {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  profile: Profile | null;
  /** 1 = ages 5–6, 2 = 7–8, 3 = 9–10 */
  level: 1 | 2 | 3;
  remainingSeconds: number;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  // Persist on every change (state is small; this is cheap).
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* full */ }
  }, [state]);

  // Push audio + motion prefs to the imperative engines / DOM.
  useEffect(() => {
    setAudioPrefs(state.settings.muted, state.settings.volume);
    if (state.settings.musicOn && !state.settings.muted) startMusic();
    else stopMusic();
    document.documentElement.classList.toggle("reduce-motion", state.settings.reducedMotion);
  }, [state.settings.muted, state.settings.volume, state.settings.musicOn, state.settings.reducedMotion]);

  const profile = state.profiles.find(p => p.id === state.activeId) ?? null;
  const age = profile?.age ?? 6;
  const level: 1 | 2 | 3 = age <= 6 ? 1 : age <= 8 ? 2 : 3;
  const used = profile?.usage[todayKey()] ?? 0;
  const remainingSeconds = Math.max(0, state.settings.dailyLimitMin * 60 - used);

  const value = useMemo(
    () => ({ state, dispatch, profile, level, remainingSeconds }),
    [state, profile, level, remainingSeconds]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
