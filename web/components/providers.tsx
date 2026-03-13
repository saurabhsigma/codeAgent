"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiLogin, apiMe, apiSignup, sessionStorageKey, type AuthSession, type AuthUser } from "@/lib/api";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type WorkspaceContextValue = {
  ready: boolean;
  profile: AuthUser | null;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const themeStorageKey = "studio-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey) as Theme | null;
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    void (async () => {
      const raw = window.localStorage.getItem(sessionStorageKey);
      if (raw) {
        try {
          const session = JSON.parse(raw) as AuthSession;
          if (session?.token) {
            const { user } = await apiMe(session.token);
            setProfile(user);
          }
        } catch {
          window.localStorage.removeItem(sessionStorageKey);
        }
      }
      setReady(true);
    })();
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  async function login(email: string, password: string) {
    setAuthError("");
    const { token, user } = await apiLogin(email, password);
    const session: AuthSession = { ...user, token };
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    setProfile(user);
  }

  async function signup(name: string, email: string, password: string) {
    setAuthError("");
    const { token, user } = await apiSignup(name, email, password);
    const session: AuthSession = { ...user, token };
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    setProfile(user);
  }

  function signOut() {
    setProfile(null);
    window.localStorage.removeItem(sessionStorageKey);
  }

  const themeValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  const workspaceValue = {
    ready,
    profile,
    authError,
    login,
    signup,
    signOut,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <WorkspaceContext.Provider value={workspaceValue}>
        {children}
      </WorkspaceContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within Providers.");
  }

  return context;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within Providers.");
  }

  return context;
}
