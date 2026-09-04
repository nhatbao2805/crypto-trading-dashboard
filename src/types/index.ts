// --- COMPREHENSIVE TYPESCRIPT DEFINITIONS FOR CRYPTO MASTER DASHBOARD ---

export type MainTab = "theory" | "practice" | "journal" | "news" | "ai_trader" | "human_trader";
export type TheorySubTab = "reader" | "atlas";
export type JournalSubTab = "trades" | "notes" | "aireview";
export type NewsSubTab = "daily" | "analyze" | "feed" | "article_reader";
export type AiTraderSubTab = "screener" | "cockpit" | "workspace" | "council" | "hypo_eval" | "chat";
export type HumanTraderSubTab = "trade_desk" | "positions" | "history";

export interface VolatilityEvent {
  id: string;
  timestamp: string;
  coin: string;
  symbol: string;
  type: string;
  badge: string;
  price: number;
  changePct: number;
  color: "emerald" | "rose" | "amber" | "purple";
  description: string;
}

// 1. Module 1: Theory
export interface Chapter {
  id: number;
  title: string;
  sectionCount?: number;
  content?: string;
  summary?: string;
}

export interface GlossaryTerm {
  term: string;
  origin: string;
  desc: string;
  category?: string;
}

export interface TheoryData {
  chapters: Chapter[];
  glossary: GlossaryTerm[];
}

// 2. Module 2: Practice
export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  vol?: number;
  label?: string;
  labelColor?: string;
}

export interface ChartZone {
  type: "support" | "resistance" | "fvg" | "order_block";
  top: number;
  bottom: number;
  label?: string;
}

export interface TradeSetup {
  entry: number;
  sl: number;
  tp: number;
  startIndex?: number;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  candles: CandleData[];
  zones?: ChartZone[];
  tradeSetup?: TradeSetup;
  title?: string;
  timeframe?: string;
}

export interface PracticeOption {
  id: "A" | "B" | "C" | "D";
  text: string;
  isCorrect: boolean;
}

export interface PracticeScenario {
  id: number;
  chapterId: number;
  level: "basic" | "intermediate" | "advanced";
  levelLabel: string;
  category: string;
  categoryName: string;
  title: string;
  description: string;
  chartConfig?: ChartConfig;
  question: string;
  options: PracticeOption[];
  explanation: string;
}

export interface PracticeStats {
  total: number;
  correct: number;
  streak: number;
  answered: Record<number, { chosenOption: string; isCorrect: boolean; timestamp: string }>;
  chapterStats: Record<number, { total: number; correct: number }>;
}

// 3. Module 3: Trade Journal & Notes
export type TradeType = "LONG" | "SHORT" | "SPOT_BUY" | "SPOT_SELL";
export type TradeStatus = "WIN" | "LOSS" | "BREAKEVEN" | "OPEN";

export interface TradeEntry {
  id?: number;
  date: string;
  coin: string;
  type: TradeType;
  entry_price: number;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  position_size?: number;
  pnl_amount?: number;
  pnl_percent?: number;
  status: TradeStatus;
  notes?: string;
  setup_confluences?: string[] | string;
  rules_checked?: string[] | string;
  emotions?: string;
  images?: string[] | string;
  created_at?: string;
  updated_at?: string;
}

export interface TradeStatsSummary {
  winRate?: number | string;
  totalPnl?: number | string;
  totalPnL?: number | string;
  totalTrades?: number;
  profitFactor?: number | string;
  winTrades?: number;
  lossTrades?: number;
  breakevenTrades?: number;
  openTrades?: number;
}

export interface NoteEntry {
  id?: number;
  title: string;
  category: string;
  content: string;
  is_pinned?: number | boolean;
  images?: string[] | string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export type NoteCategory = 
  | "ALL"
  | "Tâm Lý & Kỷ Luật"
  | "Phân Tích Thị Trường"
  | "Kinh Nghiệm / Bài Học"
  | "Kế Hoạch Trade"
  | "Ghi Chú Chung";

export type AiReviewPeriod = "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL" | "CUSTOM";

export interface TradeReviewResult {
  periodType: string;
  totalTrades: number;
  disciplineScore: number;
  winRate: number;
  totalPnl: number;
  profitFactor: number;
  summary: string;
  checklistAnalysis: {
    missingSlCount: number;
    badRrCount: number;
    overtradingDays: number;
    revengeTradeCount: number;
  };
  recommendations: string[];
  detailedTradeAudits?: Array<{
    id: number;
    coin: string;
    type: string;
    pnlAmount: number;
    issues: string[];
    isCompliant: boolean;
  }>;
}

export interface SavedTradeReview {
  id: number;
  period_type: string;
  start_date?: string;
  end_date?: string;
  coin_filter?: string;
  total_trades: number;
  discipline_score: number;
  analysis_data: string | TradeReviewResult;
  created_at: string;
}

// 4. Module 4: News & AGY Terminal
export interface BinanceTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volumeUsdt?: number;
  fundingRate?: string;
}

export interface NewsArticle {
  id?: string;
  title: string;
  url: string;
  source: string;
  sourceType?: "INVESTING" | "FOREX_FACTORY" | "CRYPTO";
  publishedAt?: string;
  category?: string;
  summary?: string;
  translatedTitle?: string;
  translatedSummary?: string;
  sentiment?: "BULLISH" | "BEARISH" | "NEUTRAL";
  impactLevel?: "HIGH" | "MEDIUM" | "LOW";
  agyDiagnosis?: string;
  originalSnippet?: string;
}

export interface NewsAnalysisResult {
  coin: string;
  price: number;
  change24h: number;
  volumeUsdt: number;
  sentimentScore: number; // 0 to 100 (50 is neutral, >50 is bullish)
  bullishPercent: number;
  bearishPercent: number;
  impactLevel: "HIGH" | "MEDIUM" | "LOW";
  impactVerdict: "BULLISH" | "BEARISH" | "NEUTRAL";
  catalysts: string[];
  summary: string;
  recommendations: string[];
  articles: NewsArticle[];
  terminalLogs?: string;
  time?: string;
}

export interface FocusCoinDetail {
  coin: string;
  currentPrice: number;
  change24h: number;
  impactHeadline: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  analysis: string;
}

export interface ActionableTradeSetup {
  coin: string;
  bias: "LONG" | "SHORT" | "CHỜ RETEST";
  entryZone: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  riskRewardRatio: string;
  trapWarning: string;
  rationale: string;
}

export interface ShortTermHoldItem {
  coin: string;
  name?: string;
  holdingPeriod: string; // e.g. "3 - 7 ngày", "1 - 2 tuần"
  accumulationZone: string;
  targetPrice: string;
  invalidationLevel: string;
  catalyst: string;
  riskRating: "THẤP" | "TRUNG BÌNH" | "CAO";
  rationale: string;
}

export interface DailyMarketBrief {
  id?: number;
  date: string;
  macroHeadline: string;
  marketMood: "BULLISH" | "BEARISH" | "NEUTRAL" | "GREED" | "FEAR";
  sentimentScore: number;
  executiveSummary: string[];
  focusCoins: FocusCoinDetail[];
  actionableTradeSetups: ActionableTradeSetup[];
  shortTermHolds?: ShortTermHoldItem[];
  macroSources?: string[];
  riskNotice: string;
  createdAt?: string;
  rawData?: any;
  // Backward compatibility / DB aliases
  macro_headline?: string;
  market_mood?: string;
  sentiment_score?: number;
  executive_summary?: string[];
  focus_coins?: FocusCoinDetail[];
  actionable_trade_setups?: ActionableTradeSetup[];
  short_term_holds?: ShortTermHoldItem[];
  macro_sources?: string[];
  risk_notice?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agy" | "system";
  text: string;
  timestamp: string;
  coin?: string;
}

// Toast
export interface ToastInfo {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export interface PracticeProgress {
  stats_data?: any;
  updated_at?: string;
}

// 5. Module 5: Multi-Agent AI Trader Council
export interface TechnicalView {
  agent_id: string;
  agent_name: string;
  avatar: string;
  signal: string;
  estimatedRsi: number;
  support_zone: string;
  resistance_zone: string;
  summary: string;
  recommended_entry: string;
  trigger_condition: string;
}

export interface MacroView {
  agent_id: string;
  agent_name: string;
  avatar: string;
  signal: string;
  fundingRate: string;
  volumeUsd: string;
  summary: string;
  fundingAnalysis: string;
}

export interface RiskView {
  agent_id: string;
  agent_name: string;
  avatar: string;
  risk_score: number;
  risk_level: string;
  stop_loss: string;
  take_profit_1: string;
  take_profit_2: string;
  risk_reward_ratio: string;
  recommended_max_leverage: string;
  capital_allocation: string;
  advice: string;
}

export interface ValidatorView {
  agent_id: string;
  agent_name: string;
  avatar: string;
  trap_warning: string;
  critical_question: string;
  invalidation_level: string;
}

export interface MasterVerdict {
  agent_id: string;
  agent_name: string;
  avatar: string;
  coin: string;
  current_price: string;
  action: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL" | "OBSERVE";
  action_label: string;
  probability_pct: number;
  entry_zone: string;
  stop_loss: string;
  take_profit: string;
  key_reasons: string[];
  vital_warning: string;
  summary_paragraph: string;
}

export interface CouncilDebateResult {
  success: boolean;
  coin: string;
  tradingStyle?: "SCALPING" | "DAY_TRADE" | "SWING" | string;
  timestamp: string;
  liveMarket?: BinanceTicker | any;
  technical_view: TechnicalView;
  macro_view: MacroView;
  risk_view: RiskView;
  validator_view: ValidatorView;
  master_verdict: MasterVerdict;
  token_metrics?: {
    last_tokens?: number;
    saved_tokens?: number;
    savings_pct?: number;
    latency_ms?: number;
    model?: string;
  };
}

export interface UserPredictionEvaluation {
  success: boolean;
  coin: string;
  hypothesis: string;
  userAction: string;
  probability_pct: number;
  risk_score: number;
  verdict: string;
  verdictColor: string;
  pros: string[];
  cons: string[];
  suggested_setup: {
    entry: string;
    stop_loss: string;
    take_profit: string;
    leverage: string;
    risk_reward: string;
  };
  advice: string;
}

// 6. Module 6: Human Trader (Realtime Paper Trading)
export interface PaperAccount {
  balance: number;
  initialCapital: number;
  lockedMargin: number;
  availableBalance: number;
  updatedAt: string;
}

export interface PaperPosition {
  id: number;
  date: string;
  coin: string;
  type: "LONG" | "SHORT";
  entry_price: number;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  leverage: number;
  position_size: number;
  margin: number;
  pnl_amount?: number;
  pnl_percent?: number;
  status: "OPEN" | "CLOSED" | "LIQUIDATED";
  close_reason?: string;
  ai_verdict?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaperHistoryStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  totalPnl: number;
}

// 7. 24/7 Market Screener & NLP Strategy Types
export interface ScreenerCandidate {
  symbol: string;
  coin: string;
  price: number;
  change24h: number;
  volumeUsdt: number;
  volumeUsdFormatted: string;
  estimatedRsi: number;
  confluenceScore: number;
  signal: string;
  action: "STRONG_BUY" | "BUY" | "SELL" | "OBSERVE";
  setupType: "BREAKOUT" | "REBOUND" | "OVERBOUGHT_TRAP" | "RANGE";
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
  rrRatio: string;
  trapWarning: string;
}

export interface MarketScreenerResult {
  success: boolean;
  timestamp: string;
  totalScanned: number;
  bullishBreadth: number;
  topBreakouts: ScreenerCandidate[];
  topOversold: ScreenerCandidate[];
  topOverbought: ScreenerCandidate[];
  rankedSignals: ScreenerCandidate[];
}

export interface NlpStrategyConfig {
  strategy_name: string;
  intent_summary: string;
  filters: {
    min_volume_usd: number;
    min_price_change: number;
    target_rsi_range: string;
    market_type: string;
  };
  execution_steps: string[];
  estimated_matches_count: number;
}

export interface NlpStrategyResponse {
  success: boolean;
  original_prompt: string;
  strategy_config: NlpStrategyConfig;
  active_matching_candidates: ScreenerCandidate[];
  created_at: string;
}

export interface TelegramStatus {
  success: boolean;
  configured: boolean;
  chatId: string;
  lastAlerts?: Array<{
    symbol: string;
    coin: string;
    score: number;
    action: string;
    time: string;
  }>;
}

export interface CandidateSetup {
  coin: string;
  price: string;
  change24h: string;
  direction: string;
  thesis: string;
}

export interface AvoidCoin {
  coin: string;
  reason: string;
}

export interface TimeAlert {
  time: string;
  event: string;
  impact: string;
}

export interface MarketPillar {
  symbol: string;
  name: string;
  role: string;
  price: string;
  change24h: string;
  rsi: number;
  trend: string;
  support?: string;
  resistance?: string;
}

export interface MarketBreadth {
  greenCount: number;
  redCount: number;
  totalCoins: number;
  breadthPct: number;
  avgAltChange: number;
}

export interface MarketSentiment {
  fearGreedScore: number;
  fearGreedLabel: string;
  capitalFlowSummary: string;
}

export interface DailyBriefingData {
  success: boolean;
  date: string;
  isoDate: string;
  healthScore: number;
  regime: string;
  regimeStatus: "SAFE" | "NEUTRAL" | "CAUTION";
  regimeSummary: string;
  marketBreadth?: MarketBreadth;
  sentiment?: MarketSentiment;
  pillars?: MarketPillar[];
  macro: {
    btcPrice: string;
    btcChange24h: string;
    rsi14: number;
    trend: string;
    fundingRate: string;
    fundingCondition: string;
  };
  candidateSetups: CandidateSetup[];
  avoidCoins: AvoidCoin[];
  timeAlerts: TimeAlert[];
  disciplineRules: string[];
}

export interface DailyReviewData {
  success: boolean;
  date: string;
  formattedDate: string;
  stats: {
    totalTrades: number;
    closedTrades: number;
    winningTrades: number;
    losingTrades: number;
    beTrades: number;
    winRate: number;
    totalPnL: number;
    grossProfit: number;
    grossLoss: number;
    profitFactor: string | number;
  };
  trades: Array<{
    id: number;
    coin: string;
    type: string;
    entry_price: number;
    exit_price: number;
    stop_loss: number;
    take_profit: number;
    position_size: number;
    pnl_amount: number;
    pnl_percent: number;
    status: string;
  }>;
  audit: {
    disciplineScore: number;
    strengths: string[];
    weaknesses: string[];
    lessons: string[];
  };
}



