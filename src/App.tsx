import React, { useState, useEffect } from "react";
import { MainTab, TheoryData, ToastInfo } from "./types";
import { TheoryApi } from "./services/api";
import { binanceService } from "./services/binance";
import { Sidebar } from "./components/common/Sidebar";
import { Header } from "./components/common/Header";
import { ToastContainer } from "./components/common/Toast";
import { CalculatorModal } from "./components/common/CalculatorModal";
import { GlossaryModal } from "./components/common/GlossaryModal";
import { LightboxModal } from "./components/common/LightboxModal";
import { TheoryModule } from "./components/theory/TheoryModule";
import { PracticeModule } from "./components/practice/PracticeModule";
import { JournalModule } from "./components/journal/JournalModule";
import { NewsModule } from "./components/news/NewsModule";
import { AiTraderView } from "./components/aitrader/AiTraderView";
import { HumanTraderView } from "./components/humantrader/HumanTraderView";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("theory");
  const [theoryData, setTheoryData] = useState<TheoryData>({ chapters: [], glossary: [] });
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Sidebar Layout States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState<boolean>(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState<boolean>(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Toast Helper
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Theory Data on startup with auto-retry
  useEffect(() => {
    let retryTimer: any = null;
    const loadTheory = () => {
      TheoryApi.getTheoryData()
        .then((data) => {
          if (data && data.chapters && data.chapters.length > 0) {
            setTheoryData(data);
          } else {
            retryTimer = setTimeout(loadTheory, 1500);
          }
        })
        .catch(() => {
          retryTimer = setTimeout(loadTheory, 1500);
        });
    };

    loadTheory();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  // Subscribe to real-time Binance prices
  useEffect(() => {
    const unsubscribe = binanceService.subscribe((coin, price) => {
      setLivePrices((prev) => ({ ...prev, [coin.toUpperCase()]: price }));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-[#cbd5e1] flex selection:bg-blue-600 selection:text-white">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenAddTrade={() => {
          setActiveTab("journal");
          setIsAddTradeOpen(true);
        }}
        onOpenAddNote={() => {
          setActiveTab("journal");
          setIsAddNoteOpen(true);
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden bg-[#080c14]">
        {/* Top Header Bar with Live Binance Tickers */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 max-w-[1780px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-4">
          {activeTab === "theory" && (
            <TheoryModule
              chapters={theoryData.chapters}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
            />
          )}

          {activeTab === "practice" && <PracticeModule />}

          {activeTab === "journal" && (
            <JournalModule
              livePrices={livePrices}
              onOpenLightbox={(url) => setLightboxUrl(url)}
              isAddTradeOpen={isAddTradeOpen}
              onCloseAddTrade={() => setIsAddTradeOpen(false)}
              isAddNoteOpen={isAddNoteOpen}
              onCloseAddNote={() => setIsAddNoteOpen(false)}
            />
          )}

          {activeTab === "news" && <NewsModule />}

          {activeTab === "ai_trader" && (
            <AiTraderView livePrices={livePrices} onShowToast={showToast} />
          )}

          {activeTab === "human_trader" && <HumanTraderView livePrices={livePrices} />}
        </main>
      </div>

      {/* 3. GLOBAL MODALS */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        terms={theoryData.glossary}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <LightboxModal
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />

      {/* 4. TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
