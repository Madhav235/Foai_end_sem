import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Astronaut, ChatMessage, IssPosition, IssState, NewsState, Theme } from '../types/dashboard';
import { calculateSpeedKmh, nearestLocation } from '../utils/geo';
import { readStorage, writeStorage } from '../utils/storage';
import { fetchAstronauts, fetchIssPosition } from '../services/issService';
import { fetchNews } from '../services/newsService';
import { sanitizeChatMessages } from '../utils/validation';

const THEME_KEY = 'orbitdesk.theme';
const CHAT_KEY = 'orbitdesk.chat.messages';
const ISS_REFRESH_DEBOUNCE_MS = 5000;
const ISS_SILENT_MIN_GAP_MS = 12000;
const NEWS_ERROR_TOAST_COOLDOWN_MS = 15000;

let issRefreshInFlight: Promise<void> | null = null;
let lastIssRefreshStartedAt = 0;
let lastManualIssRefreshAt = 0;
let newsRefreshInFlight: Promise<void> | null = null;
let lastNewsErrorToastAt = 0;

const initialIss: IssState = {
  current: null,
  history: [],
  speeds: [],
  currentSpeed: null,
  nearestLocation: 'Awaiting orbital fix',
  astronauts: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialNews: NewsState = {
  articles: [],
  loading: false,
  error: null,
  lastUpdated: null,
  activeCategory: 'All',
};

type DashboardStore = {
  theme: Theme;
  iss: IssState;
  news: NewsState;
  chatMessages: ChatMessage[];
  hydrateTheme: () => void;
  toggleTheme: () => void;
  refreshIss: (options?: { signal?: AbortSignal; silent?: boolean }) => Promise<void>;
  refreshAstronauts: (signal?: AbortSignal) => Promise<void>;
  refreshNews: (options?: { signal?: AbortSignal; force?: boolean }) => Promise<void>;
  refreshAll: () => Promise<void>;
  setNewsCategory: (category: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
}

function nextIssState(currentState: IssState, position: IssPosition, astronauts?: Astronaut[]): IssState {
  const previous = currentState.current;
  const speed = previous ? calculateSpeedKmh(previous, position) : null;
  const history = [...currentState.history, position].slice(-15);
  const speeds = speed
    ? [...currentState.speeds, { timestamp: position.timestamp, speed }].slice(-30)
    : currentState.speeds;

  return {
    ...currentState,
    current: position,
    history,
    speeds,
    currentSpeed: speed ?? currentState.currentSpeed,
    nearestLocation: nearestLocation(position),
    astronauts: astronauts ?? currentState.astronauts,
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  theme: 'dark',
  iss: initialIss,
  news: initialNews,
  chatMessages: sanitizeChatMessages(readStorage<ChatMessage[]>(CHAT_KEY, [])),

  hydrateTheme: () => {
    const stored = readStorage<Theme>(THEME_KEY, 'dark');
    const theme = stored === 'light' ? 'light' : 'dark';
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    writeStorage(THEME_KEY, theme);
    set({ theme });
  },

  refreshIss: async ({ signal, silent } = {}) => {
    const now = Date.now();
    if (issRefreshInFlight) return issRefreshInFlight;
    if (silent && now - lastIssRefreshStartedAt < ISS_SILENT_MIN_GAP_MS) return;
    if (!silent && now - lastManualIssRefreshAt < ISS_REFRESH_DEBOUNCE_MS) {
      toast('ISS refresh is already cooling down');
      return;
    }

    lastIssRefreshStartedAt = now;
    if (!silent) lastManualIssRefreshAt = now;
    set((state) => ({ iss: { ...state.iss, loading: !silent, error: null } }));
    issRefreshInFlight = (async () => {
      try {
        const position = await fetchIssPosition(signal);
        set((state) => ({ iss: nextIssState(state.iss, position) }));
      } catch (error) {
        if (error instanceof Error && error.name === 'CanceledError') return;
        const message = error instanceof Error ? error.message : 'Unable to fetch ISS position';
        set((state) => ({ iss: { ...state.iss, loading: false, error: message } }));
        if (!silent) toast.error('ISS telemetry unavailable. Keeping last known position.');
      } finally {
        issRefreshInFlight = null;
      }
    })();

    return issRefreshInFlight;
  },

  refreshAstronauts: async (signal) => {
    try {
      const astronauts = await fetchAstronauts(signal);
      set((state) => ({ iss: { ...state.iss, astronauts } }));
    } catch {
      set((state) => ({ iss: { ...state.iss, astronauts: state.iss.astronauts } }));
    }
  },

  refreshNews: async ({ signal, force } = {}) => {
    if (newsRefreshInFlight) return newsRefreshInFlight;
    set((state) => ({ news: { ...state.news, loading: true, error: null } }));
    newsRefreshInFlight = (async () => {
      try {
        const articles = await fetchNews({ signal, force });
        set((state) => ({
          news: { ...state.news, articles, loading: false, error: null, lastUpdated: Date.now() },
        }));
      } catch (error) {
        if (error instanceof Error && error.name === 'CanceledError') return;
        const message = error instanceof Error ? error.message : 'Unable to fetch news';
        set((state) => ({ news: { ...state.news, loading: false, error: message } }));
        const now = Date.now();
        if (now - lastNewsErrorToastAt > NEWS_ERROR_TOAST_COOLDOWN_MS) {
          toast.error('News feed unavailable');
          lastNewsErrorToastAt = now;
        }
      } finally {
        newsRefreshInFlight = null;
      }
    })();

    return newsRefreshInFlight;
  },

  refreshAll: async () => {
    await Promise.all([
      get().refreshIss({ silent: true }),
      get().refreshAstronauts(),
      get().refreshNews({ force: true }),
    ]);
  },

  setNewsCategory: (category) => set((state) => ({ news: { ...state.news, activeCategory: category } })),

  addChatMessage: (message) =>
    set((state) => {
      const chatMessages = [...state.chatMessages, message].slice(-30);
      writeStorage(CHAT_KEY, chatMessages);
      return { chatMessages };
    }),

  clearChat: () => {
    writeStorage(CHAT_KEY, []);
    set({ chatMessages: [] });
  },
}));
