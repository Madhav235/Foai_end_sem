import type { ChatMessage, IssState, NewsArticle } from '../types/dashboard';
import { http } from './http';

export type DashboardContext = {
  iss: IssState;
  news: NewsArticle[];
};

export async function askAssistant({
  message,
  messages,
  context,
  signal,
}: {
  message: string;
  messages: ChatMessage[];
  context: DashboardContext;
  signal?: AbortSignal;
}) {
  const { data } = await http.post<{ answer: string }>(
    '/api/chat',
    {
      message,
      messages: messages.slice(-8),
      context: {
        iss: {
          current: context.iss.current,
          currentSpeed: context.iss.currentSpeed,
          nearestLocation: context.iss.nearestLocation,
          astronauts: context.iss.astronauts,
          trackedPositions: context.iss.history.length,
          lastUpdated: context.iss.lastUpdated,
        },
        news: context.news.slice(0, 20),
      },
    },
    { signal },
  );
  return data.answer;
}
