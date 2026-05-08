export type Theme = 'dark' | 'light';

export type IssPosition = {
  latitude: number;
  longitude: number;
  timestamp: number;
  velocity?: number;
};

export type Astronaut = {
  name: string;
  craft: string;
};

export type IssState = {
  current: IssPosition | null;
  history: IssPosition[];
  speeds: SpeedPoint[];
  currentSpeed: number | null;
  nearestLocation: string;
  astronauts: Astronaut[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

export type SpeedPoint = {
  timestamp: number;
  speed: number;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
  description: string;
  url: string;
  category: string;
};

export type NewsState = {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  activeCategory: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};
