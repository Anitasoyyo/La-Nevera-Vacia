"use client";

import { useState, useEffect, useRef } from "react";
import { generateRecipe, type Recipe } from "./actions";

interface ActiveTimer {
  stepIndex: number;
  totalSeconds: number;
  remaining: number;
}

const extractSeconds = (text: string): number | null => {
  const hoursMatch = text.match(/(\d+)\s*hora[s]?/i);
  const minsMatch = text.match(/(\d+)\s*min(?:uto[s]?)?/i);
  let total = 0;
  if (hoursMatch) total += parseInt(hoursMatch[1]) * 3600;
  if (minsMatch) total += parseInt(minsMatch[1]) * 60;
  return total > 0 ? total : null;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (!activeTimer) return;
    if (activeTimer.remaining <= 0) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      if (Notification.permission === "granted") {
        new Notification("¡La Nevera Vacía — Listo!", {
          body: `El temporizador del paso ${activeTimer.stepIndex + 1} ha terminado.`,
        });
      }
      setActiveTimer(null);
    }
  }, [activeTimer]);

  const startTimer = (stepIndex: number, seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (Notification.permission === "default") Notification.requestPermission();
    setActiveTimer({ stepIndex, totalSeconds: seconds, remaining: seconds });
    intervalRef.current = setInterval(() => {
      setActiveTimer((prev) => prev ? { ...prev, remaining: prev.remaining - 1 } : null);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveTimer(null);
  };

  const addChip = (value: string) => {
    const trimmed = value.trim().replace(/,$/, "").trim();
    if (trimmed && !chips.includes(trimmed)) {
      setChips((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const removeChip = (index: number) => {
    setChips((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) addChip(inputValue);
  };

  const handleGenerateRecipe = async () => {
    if (chips.length === 0) return;

    setLoading(true);
    setError("");
    setRecipe(null);
    setImageUrl("");
    setImageLoading(false);
    setImageError(false);
    setActiveTab(0);
    setCheckedSteps(new Set());

    try {
      const parsed = await generateRecipe(chips.join(", "));
      setRecipe(parsed);

      setImageLoading(true);
      setImageError(false);
      setImageUrl(`/api/image?t=${Date.now()}`);
    } catch (err) {
      setError("Error al generar la receta. ¿Tienes Ollama ejecutándose?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setChips([]);
    setInputValue("");
    setRecipe(null);
    setImageUrl("");
    setImageLoading(false);
    setImageError(false);
    setError("");
    setActiveTab(0);
    setCheckedSteps(new Set());
    setActiveTimer(null);
  };

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };

  const tabs = ["Generada por IA", "Ingredientes", "Pasos"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-white/8 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <svg width="52" height="62" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 bot-logo">
            <line x1="36" y1="12" x2="36" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="36" cy="3" r="2.5" fill="var(--orange)" style={{ filter: "drop-shadow(0 0 4px var(--orange))" }}/>
            <rect x="11" y="26" width="50" height="6" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <rect x="20" y="10" width="32" height="18" rx="5" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <rect x="10" y="32" width="52" height="38" rx="10" fill="var(--green-fridge)" stroke="color-mix(in srgb, var(--orange) 25%, transparent)" strokeWidth="1.2"/>
            <circle cx="25" cy="48" r="7" fill="var(--green-deepest)"/>
            <circle cx="25" cy="48" r="3.5" fill="var(--orange)" style={{ filter: "drop-shadow(0 0 5px var(--orange))" }}/>
            <circle cx="27" cy="46" r="1" fill="white" opacity="0.6"/>
            <circle cx="47" cy="48" r="7" fill="var(--green-deepest)"/>
            <circle cx="47" cy="48" r="3.5" fill="var(--orange)" style={{ filter: "drop-shadow(0 0 5px var(--orange))" }}/>
            <circle cx="49" cy="46" r="1" fill="white" opacity="0.6"/>
            <path d="M24 62 Q36 69 48 62" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <rect x="18" y="72" width="36" height="14" rx="6" fill="var(--green-fridge)" stroke="color-mix(in srgb, var(--orange) 20%, transparent)" strokeWidth="1"/>
            <circle cx="36" cy="79" r="3" fill="var(--orange)" opacity="0.5" style={{ filter: "drop-shadow(0 0 3px var(--orange))" }}/>
          </svg>
          <span className="font-display text-white text-2xl tracking-tight">La Nevera Vacía</span>
        </div>
        <span className="flex items-center gap-1.5 text-green-300/70 text-xs font-body px-3 py-1.5 rounded-full border border-green-400/20 bg-green-500/10 relative z-10">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          IA Activa
        </span>

      </header>

      {/* Cronómetro flotante */}
      {activeTimer && (
        <div className="fixed top-20 right-4 z-50 bg-green-deepest/95 backdrop-blur-md border border-primary/50 rounded-2xl px-5 py-4 shadow-2xl animate-enter" style={{ boxShadow: "0 0 20px color-mix(in srgb, var(--orange) 30%, transparent)" }}>
          <p className="font-body text-white/40 text-[10px] uppercase tracking-widest mb-1">Paso {activeTimer.stepIndex + 1}</p>
          <p className="font-display text-4xl text-white leading-none mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatTime(activeTimer.remaining)}
          </p>
          <div className="w-full bg-white/10 rounded-full h-1 mb-3">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-1000"
              style={{ width: `${(activeTimer.remaining / activeTimer.totalSeconds) * 100}%` }}
            />
          </div>
          <button
            onClick={stopTimer}
            className="w-full font-body text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-5 md:px-8 md:py-10 max-w-lg md:max-w-2xl mx-auto w-full">

        {/* Title */}
        <div className="w-full mb-4 md:mb-7">
          <h1 className="font-display text-2xl md:text-5xl font-semibold text-white leading-tight mb-1.5">
            ¿Qué tienes en la nevera?
          </h1>
          <p className="font-body text-white/45 text-sm leading-relaxed">
            Escribe los ingredientes que tienes y la IA creará una receta para ti
          </p>
        </div>

        {/* Input area */}
        <div className="w-full mb-4 md:mb-5">
          <div className={`bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-3.5 transition-all duration-500 ${loading ? "neon-scan" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="ej: pollo, limón, espárragos..."
                className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm font-body"
              />
              {(chips.length > 0 || recipe) && (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 flex items-center gap-1.5 text-white/50 hover:text-white/90 bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 text-xs font-body px-2.5 py-1 rounded-full transition-all duration-200"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                  limpiar
                </button>
              )}
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {chips.map((chip, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-white/12 text-white/85 text-xs px-2.5 py-1 rounded-full border border-white/15 font-body"
                  >
                    {chip}
                    <button
                      onClick={() => removeChip(i)}
                      className="text-white/40 hover:text-white/80 ml-0.5 leading-none transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="font-body text-white/30 text-xs mt-1.5 px-1">
            Presiona Enter o coma para añadir cada ingrediente
          </p>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerateRecipe}
          disabled={loading || chips.length === 0}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none text-white font-body font-medium py-3.5 md:py-4 rounded-2xl transition-all duration-300 text-sm mb-5 md:mb-9 tracking-wide active:scale-[0.99] neon-btn"
        >
          {loading ? "Cocinando…" : "Generar Receta"}
        </button>

        {/* Resultado section */}
        <div className="w-full">
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-white/12" />
            <span className="font-body text-white/35 text-[10px] uppercase tracking-[0.15em]">Resultado</span>
            <div className="h-px flex-1 bg-white/12" />
          </div>

          <div className="bg-cream rounded-3xl overflow-hidden shadow-2xl shadow-black/50">

            {/* Empty state */}
            {!recipe && !loading && !error && (
              <div className="p-10 text-center animate-fade">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-mint flex items-center justify-center mx-auto mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z" />
                  </svg>
                </div>
                <p className="font-display text-lg text-green-dark mb-1.5">
                  Tu receta aparecerá aquí
                </p>
                <p className="font-body text-muted text-sm leading-relaxed max-w-[220px] mx-auto">
                  Añade ingredientes y la IA creará algo delicioso
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="p-10 text-center animate-fade">
                <div className="flex items-center justify-center gap-1.5 mb-5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary dot-bounce"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
                <p className="font-body text-secondary text-sm tracking-wide">Pensando tu receta…</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-8 text-center animate-fade">
                <p className="font-body text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Recipe with tabs */}
            {recipe && (
              <div className="animate-enter">
                {/* Tab bar */}
                <div className="flex border-b border-divider">
                  {tabs.map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 py-3 text-xs font-body tracking-wide transition-all ${
                        activeTab === i
                          ? "text-primary border-b-2 border-primary -mb-px font-medium"
                          : "text-muted hover:text-muted-dark"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab: Generada por IA */}
                {activeTab === 0 && (
                  <div className="p-5">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-green-medium to-green-light relative">
                      {imageLoading && !imageError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-white/40 dot-bounce"
                                style={{ animationDelay: `${i * 0.18}s` }}
                              />
                            ))}
                          </div>
                          <p className="font-body text-white/40 text-xs">Generando imagen…</p>
                        </div>
                      )}
                      {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="font-body text-white/30 text-xs">Sin imagen disponible</p>
                        </div>
                      )}
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                          onLoad={() => setImageLoading(false)}
                          onError={() => { setImageLoading(false); setImageError(true); }}
                        />
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-display text-2xl font-semibold text-green-dark flex-1 pr-3 leading-tight">
                        {recipe.title}
                      </h3>
                      <span className="font-body text-primary text-xs px-3 py-1.5 rounded-full border border-primary/25 bg-primary/6 whitespace-nowrap mt-1">
                        {recipe.prepTime}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 divide-x divide-divider pt-4 border-t border-divider">
                      {[
                        { val: recipe.nutrition.calories, unit: "kcal" },
                        { val: `${recipe.nutrition.protein}g`, unit: "proteína" },
                        { val: `${recipe.nutrition.carbs}g`, unit: "carbs" },
                        { val: `${recipe.nutrition.fat}g`, unit: "grasa" },
                      ].map(({ val, unit }, i) => (
                        <div key={i} className="text-center px-1">
                          <p className="font-display text-xl font-semibold text-green-dark">{val}</p>
                          <p className="font-body text-[10px] uppercase tracking-widest text-secondary mt-0.5">{unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Ingredientes */}
                {activeTab === 1 && (
                  <div className="p-5">
                    <p className="font-body text-[10px] uppercase tracking-widest text-muted mb-3">
                      Ingredientes usados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip, i) => (
                        <span
                          key={i}
                          className="font-body bg-green-dark/6 text-green-dark text-sm px-4 py-2 rounded-full border border-green-dark/10 font-medium"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Pasos */}
                {activeTab === 2 && (
                  <div className="p-5 space-y-2">
                    {recipe.steps.map((step, i) => {
                      const secs = extractSeconds(step);
                      const isActive = activeTimer?.stepIndex === i;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                            checkedSteps.has(i) ? "bg-step-checked" : "hover:bg-step-hover"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checkedSteps.has(i)}
                            onChange={() => toggleStep(i)}
                            className="mt-0.5 w-4 h-4 rounded border-2 border-green-light accent-primary flex-shrink-0 cursor-pointer"
                          />
                          <span
                            className={`font-body text-sm leading-relaxed flex-1 ${
                              checkedSteps.has(i) ? "line-through text-disabled" : "text-green-dark"
                            }`}
                          >
                            {step}
                          </span>
                          {secs && (
                            <button
                              onClick={() => isActive ? stopTimer() : startTimer(i, secs)}
                              title={isActive ? "Cancelar" : `Iniciar ${formatTime(secs)}`}
                              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-body transition-all ${
                                isActive
                                  ? "bg-primary/15 text-primary border border-primary/30"
                                  : "bg-green-dark/8 text-green-light border border-green-dark/10 hover:bg-primary/10 hover:text-primary hover:border-primary/25"
                              }`}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {isActive ? formatTime(activeTimer!.remaining) : formatTime(secs)}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bot difuminado — fondo inferior de toda la página */}
      <img
        src="/images/bot-frontal.png"
        alt=""
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "auto",
          maxHeight: "60vh",
          objectFit: "cover",
          objectPosition: "bottom center",
          filter: "blur(1px) brightness(0.55) saturate(0.3)",
          opacity: 0.75,
          maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 50%, transparent 100%)",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Footer */}
      <footer className="relative text-center py-8 px-4 flex flex-col items-center gap-4" style={{ zIndex: 1 }}>
        <p className="font-body text-white/55 text-xs tracking-widest uppercase">
          La Nevera Vacía &nbsp;·&nbsp; Cocina Inteligente con IA
        </p>
      </footer>
    </div>
  );
}
