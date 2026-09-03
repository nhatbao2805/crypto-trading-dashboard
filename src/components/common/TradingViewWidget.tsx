import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RefreshCw, BarChart2 } from "lucide-react";

interface TradingViewWidgetProps {
  symbol: string;
  theme?: "dark" | "light";
  autosize?: boolean;
  height?: string | number;
  interval?: string;
  containerId?: string;
  allowSymbolChange?: boolean;
  enableDrawing?: boolean;
  className?: string;
  studies?: string[];
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = "BTC",
  theme = "dark",
  autosize = true,
  height = "100%",
  interval: defaultInterval = "15",
  containerId: customContainerId,
  allowSymbolChange = true,
  enableDrawing = true,
  className = "",
  studies = ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"]
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartInterval, setChartInterval] = useState(defaultInterval);
  const [reloadKey, setReloadKey] = useState(0);

  // Generate a stable unique container ID
  const uniqueIdRef = useRef(
    customContainerId || `tradingview_pro_${Math.random().toString(36).substring(2, 9)}`
  );
  const containerId = uniqueIdRef.current;

  // Format symbol for Binance
  const formattedSymbol = symbol.includes(":")
    ? symbol
    : `BINANCE:${symbol.toUpperCase().replace("USDT", "")}USDT`;

  useEffect(() => {
    let isMounted = true;

    const initWidget = () => {
      if (!containerRef.current) return;

      // Clear existing children in container
      containerRef.current.innerHTML = "";

      const widgetDiv = document.createElement("div");
      widgetDiv.id = containerId;
      widgetDiv.style.width = "100%";
      widgetDiv.style.height = "100%";
      containerRef.current.appendChild(widgetDiv);

      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: autosize,
          width: "100%",
          height: height,
          symbol: formattedSymbol,
          interval: chartInterval,
          timezone: "Asia/Ho_Chi_Minh",
          theme: theme,
          style: "1", // Candlesticks
          locale: "vi_VN",
          toolbar_bg: "#080c14",
          enable_publishing: false,
          hide_side_toolbar: !enableDrawing, // false enables 100% drawing toolbar!
          allow_symbol_change: allowSymbolChange,
          container_id: containerId,
          withdateranges: true,
          hide_top_toolbar: false,
          save_image: true,
          studies: studies,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          overrides: {
            "paneProperties.background": "#080c14",
            "paneProperties.vertGridProperties.color": "rgba(30, 41, 59, 0.4)",
            "paneProperties.horzGridProperties.color": "rgba(30, 41, 59, 0.4)",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#94a3b8",
            "mainSeriesProperties.candleStyle.upColor": "#00c076",
            "mainSeriesProperties.candleStyle.downColor": "#ff3b69",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#374151",
            "mainSeriesProperties.candleStyle.borderUpColor": "#00c076",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ff3b69",
            "mainSeriesProperties.candleStyle.wickUpColor": "#00c076",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ff3b69"
          }
        });
      }
    };

    // Load TradingView Script dynamically if not present
    if (!(window as any).TradingView) {
      const scriptId = "tradingview-widget-script";
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement;

      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.type = "text/javascript";
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
          if (isMounted) initWidget();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          if (isMounted) initWidget();
        });
      }
    } else {
      initWidget();
    }

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [formattedSymbol, chartInterval, theme, reloadKey, enableDrawing]);

  const intervals = [
    { label: "1m", val: "1" },
    { label: "5m", val: "5" },
    { label: "15m", val: "15" },
    { label: "1H", val: "60" },
    { label: "4H", val: "240" },
    { label: "1D", val: "D" },
    { label: "1W", val: "W" }
  ];

  return (
    <div
      className={`relative flex flex-col bg-[#080c14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-2xl bg-[#080c14] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-indigo-500/50"
          : className
      }`}
      style={{ height: isFullscreen ? "calc(100vh - 32px)" : height || "620px" }}
    >
      {/* Top Chart Toolbar */}
      <div className="h-11 px-4 bg-[#0b101b] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-sm text-white tracking-tight">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <span className="font-mono text-sky-400">{symbol.toUpperCase().replace("USDT", "")}</span>
            <span className="text-slate-400 text-xs font-mono">/ USDT</span>
            <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
              Binance Live
            </span>
          </div>

          {/* Timeframe Quick Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-[#06090e] p-0.5 rounded-lg border border-slate-800">
            {intervals.map((item) => (
              <button
                key={item.val}
                onClick={() => setChartInterval(item.val)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  chartInterval === item.val
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Full Drawing Tools
          </span>

          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Tải lại biểu đồ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Thu nhỏ lại" : "Mở toàn màn hình"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-sky-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TradingView Render Container */}
      <div className="flex-1 w-full relative min-h-0 bg-[#080c14]">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
