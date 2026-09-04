// --- TYPED API CLIENT SERVICE ---
import {
  Chapter,
  TheoryData,
  TradeEntry,
  TradeStatsSummary,
  NoteEntry,
  TradeReviewResult,
  SavedTradeReview,
  NewsAnalysisResult,
  BinanceTicker,
  PracticeProgress,
  CouncilDebateResult,
  UserPredictionEvaluation,
  PaperAccount,
  PaperPosition,
  PaperHistoryStats,
  MarketScreenerResult,
  NlpStrategyResponse,
  TelegramStatus,
  VolatilityEvent,
  DailyBriefingData,
  DailyReviewData
} from "../types";

const API_BASE = "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const rawText = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(rawText);
  } catch (_) {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(`Phản hồi không hợp lệ từ máy chủ: ${rawText.slice(0, 80)}`);
  }

  if (!res.ok) {
    throw new Error(json?.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return json as T;
}

// 1. Theory APIs
export const TheoryApi = {
  getTheoryData: () => request<TheoryData>("/api/theory"),
  getChapter: (id: number) => request<Chapter>(`/api/theory/chapter/${id}`),
  getGlossary: () => request<{ glossary: any[] }>("/api/theory/glossary"),
};

// 2. Journal & Notes APIs
export const JournalApi = {
  getEntries: (filters?: { coin?: string; status?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.coin) params.append("coin", filters.coin);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    const qs = params.toString();
    return request<{ entries: TradeEntry[] }>(`/api/journal${qs ? "?" + qs : ""}`);
  },

  createEntry: (data: Partial<TradeEntry>) =>
    request<{ success: boolean; entry: TradeEntry }>("/api/journal", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEntry: (id: number, data: Partial<TradeEntry>) =>
    request<{ success: boolean; entry: TradeEntry }>(`/api/journal/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteEntry: (id: number) =>
    request<{ success: boolean; id: number }>(`/api/journal/${id}`, {
      method: "DELETE",
    }),

  getStats: () => request<{ stats: TradeStatsSummary }>("/api/journal/stats"),

  closeLiveTrade: (id: number, livePrice: number) =>
    request<{ success: boolean; entry: TradeEntry }>(`/api/journal/close-live/${id}`, {
      method: "POST",
      body: JSON.stringify({ livePrice }),
    }),

  runAiReview: (payload: {
    periodType?: string;
    startDate?: string;
    endDate?: string;
    coinFilter?: string;
    save?: boolean;
    livePrices?: Record<string, number>;
  }) =>
    request<{ success: boolean; review: TradeReviewResult; savedRecord?: SavedTradeReview }>(
      "/api/journal/ai-review",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  getAiReviewHistory: () =>
    request<{ history: SavedTradeReview[] }>("/api/journal/ai-review/history"),

  deleteAiReview: (id: number) =>
    request<{ success: boolean; id: number }>(`/api/journal/ai-review/${id}`, {
      method: "DELETE",
    }),

  sendCoachChat: (prompt: string, livePrices?: Record<string, number>) =>
    request<{ success: boolean; response: string; output?: string }>("/api/journal/coach-chat", {
      method: "POST",
      body: JSON.stringify({ prompt, livePrices }),
    }),
};

// Notes APIs
export const NotesApi = {
  getAllNotes: (filters?: { category?: string; search?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "ALL") params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.date) params.append("date", filters.date);
    const qs = params.toString();
    return request<{ notes: NoteEntry[] }>(`/api/notes${qs ? "?" + qs : ""}`);
  },

  createNote: (data: Partial<NoteEntry>) =>
    request<{ success: boolean; note: NoteEntry }>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateNote: (id: number, data: Partial<NoteEntry>) =>
    request<{ success: boolean; note: NoteEntry }>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteNote: (id: number) =>
    request<{ success: boolean; id: number }>(`/api/notes/${id}`, {
      method: "DELETE",
    }),

  togglePin: (id: number) =>
    request<{ success: boolean; note: NoteEntry }>(`/api/notes/${id}/pin`, {
      method: "POST",
    }),
};

// Upload API
export const UploadApi = {
  uploadBase64: (base64Data: string) =>
    request<{ success: boolean; url: string; filename: string; size: number }>("/api/upload", {
      method: "POST",
      body: JSON.stringify({ base64Data }),
    }),
};

// Practice Progress API
export const PracticeApi = {
  getProgress: () =>
    request<{ success: boolean; progress?: any }>("/api/practice/progress"),

  saveProgress: (statsData: any) =>
    request<{ success: boolean }>("/api/practice/progress", {
      method: "POST",
      body: JSON.stringify(statsData),
    }),
};

// News & AGY APIs
export const NewsApi = {
  getMarketTicker: (coin: string) =>
    request<{ ticker: BinanceTicker }>(`/api/market/ticker?coin=${coin.toUpperCase()}`),

  getVolatilityStream: (limit = 10) =>
    request<{ success: boolean; events: VolatilityEvent[] }>(`/api/market/volatility-stream?limit=${limit}`),

  analyzeCoin: (payload: { coin: string; marketOverride?: any; articlesOverride?: any }) =>
    request<{ success: boolean; analysis: NewsAnalysisResult }>("/api/news/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getHistory: (coin?: string) =>
    request<{ history: any[] }>(`/api/news/history${coin ? "?coin=" + coin : ""}`),

  execAgyPrompt: (payload: { prompt: string; coin?: string; clientMarket?: any }) =>
    request<{ success: boolean; output: string; coin?: string }>("/api/agy/exec", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAgyHistory: (coin?: string) =>
    request<{ history: Array<{ id: number; coin: string; prompt: string; response: string; created_at: string }> }>(
      `/api/agy/history${coin ? "?coin=" + coin : ""}`
    ),

  clearAgyHistory: (coin?: string) =>
    request<{ success: boolean }>("/api/agy/history/clear", {
      method: "POST",
      body: JSON.stringify({ coin }),
    }),
};

// 5. Multi-Agent AI Trader Council APIs
export const AiTraderApi = {
  runCouncilAnalysis: (payload: { coin: string; clientMarket?: any; forceRefresh?: boolean; tradingStyle?: "SCALPING" | "DAY_TRADE" | "SWING" }) =>
    request<CouncilDebateResult>("/api/ai-trader/council/debate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getDebates: (coin?: string) =>
    request<{ debates: CouncilDebateResult[] }>(`/api/ai-trader/debates${coin ? "?coin=" + coin : ""}`),

  evaluatePrediction: (payload: { coin: string; hypothesis: string; userAction?: string; clientMarket?: any }) =>
    request<{ success: boolean; evaluation: UserPredictionEvaluation }>("/api/ai-trader/evaluate-prediction", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPredictions: (coin?: string) =>
    request<{ predictions: any[] }>(`/api/ai-trader/predictions${coin ? "?coin=" + coin : ""}`),

  chatCouncil: (payload: { prompt: string; coin?: string; clientMarket?: any }) =>
    request<{ success: boolean; coin: string; reply?: string; output?: string }>("/api/ai-trader/chat-council", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  executeAutoTrade: (payload: {
    coin?: string;
    riskPercent?: number;
    minConfidence?: number;
    forceTrade?: boolean;
    ttlMinutes?: number | string | null;
    maxLossUsd?: number | string | null;
    margin?: number | string | null;
    leverage?: number | string | null;
    tradingStyle?: "SCALPING" | "DAY_TRADE" | "SWING";
  }) =>
    request<{
      success: boolean;
      executed: boolean;
      coin: string;
      livePrice: number;
      verdict: any;
      position: PaperPosition | null;
      debate: CouncilDebateResult;
      token_metrics?: any;
      executionReason: string;
      latencyMs: number;
    }>("/api/ai-trader/auto-trade/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // 24/7 Market Screener
  getScreenerLive: () =>
    request<MarketScreenerResult>("/api/ai-trader/screener/live"),

  scanScreenerNow: () =>
    request<MarketScreenerResult>("/api/ai-trader/screener/scan-now", {
      method: "POST",
    }),

  // NLP Strategy Parser
  parseNlpStrategy: (prompt: string) =>
    request<NlpStrategyResponse>("/api/ai-trader/nlp/parse-strategy", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  // Telegram Alert
  getTelegramStatus: () =>
    request<TelegramStatus>("/api/ai-trader/telegram/status"),

  updateTelegramConfig: (token: string, chatId: string) =>
    request<{ success: boolean; configured: boolean; message: string }>("/api/ai-trader/telegram/config", {
      method: "POST",
      body: JSON.stringify({ token, chatId }),
    }),

  sendTestTelegramAlert: () =>
    request<{ success: boolean; message: string }>("/api/ai-trader/telegram/test-alert", {
      method: "POST",
    }),

  // Daily Pre-Market Briefing & Post-Market Review
  getDailyBriefing: () =>
    request<DailyBriefingData>("/api/ai-trader/daily-briefing"),

  getDailyReview: (date?: string) =>
    request<DailyReviewData>(`/api/ai-trader/daily-review${date ? "?date=" + date : ""}`),

  saveDailyReviewToNote: (payload: any) =>
    request<{ success: boolean; note: any }>("/api/ai-trader/daily-review/save-note", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// 6. Human Trader (Realtime Paper Trading) APIs
export const PaperTraderApi = {
  getAccount: () =>
    request<{ account: PaperAccount }>("/api/paper-trader/account"),

  resetAccount: (initialCapital = 10000) =>
    request<{ success: boolean; account: PaperAccount }>("/api/paper-trader/account/reset", {
      method: "POST",
      body: JSON.stringify({ initialCapital }),
    }),

  getPositions: (coin?: string) =>
    request<{ positions: PaperPosition[] }>(`/api/paper-trader/positions${coin ? "?coin=" + coin : ""}`),

  getLivePositions: () =>
    request<{
      success: boolean;
      positions: Array<
        PaperPosition & {
          currentLivePrice: number;
          unrealizedPnlAmount: number;
          unrealizedPnlPercent: number;
          distanceToStopLossPercent: number | null;
          distanceToTakeProfitPercent: number | null;
          isNearStopLoss: boolean;
          isRiskFree: boolean;
        }
      >;
      totalUnrealizedPnl: number;
      count: number;
      timestamp: string;
    }>("/api/paper-trader/positions/live"),

  openPosition: (payload: {
    coin: string;
    type: "LONG" | "SHORT";
    entry_price: number;
    stop_loss?: number;
    take_profit?: number;
    leverage?: number;
    margin: number;
    ai_verdict?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; position: PaperPosition; account: PaperAccount }>("/api/paper-trader/positions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  closePosition: (id: number, exitPrice: number, closeReason = "MANUAL") =>
    request<{ success: boolean; position: PaperPosition; account: PaperAccount }>(
      `/api/paper-trader/positions/${id}/close`,
      {
        method: "POST",
        body: JSON.stringify({ exitPrice, closeReason }),
      }
    ),

  getHistory: (filters?: { coin?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.coin) params.append("coin", filters.coin);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    const qs = params.toString();
    return request<{ trades: PaperPosition[]; stats: PaperHistoryStats }>(
      `/api/paper-trader/history${qs ? "?" + qs : ""}`
    );
  },
};
