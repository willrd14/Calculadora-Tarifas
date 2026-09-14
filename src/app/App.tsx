import { lazy, Suspense, useState, type ReactNode } from "react";
import { QuoteForm } from "../features/quote/QuoteForm";
import type { QuoteFormValues } from "../features/quote/schema";

// Carga diferida: agrupa el plugin SQL (y su chunk) aparte del bundle
// principal, ya que solo hace falta al abrir la pestaña de Historial.
const HistoryList = lazy(() =>
  import("../features/history/HistoryList").then((mod) => ({
    default: mod.HistoryList,
  })),
);

const SettingsPage = lazy(() =>
  import("../features/settings/SettingsPage").then((mod) => ({
    default: mod.SettingsPage,
  })),
);

const ClientsPage = lazy(() =>
  import("../features/clients/ClientsPage").then((mod) => ({
    default: mod.ClientsPage,
  })),
);

type Tab = "quote" | "history" | "clients" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "quote", label: "nueva-cotizacion" },
  { id: "history", label: "historial" },
  { id: "clients", label: "clientes" },
  { id: "settings", label: "config" },
];

function App() {
  const [tab, setTab] = useState<Tab>("quote");
  // Cambiar `formKey` fuerza a QuoteForm a remontarse con nuevos
  // defaultValues (react-hook-form solo los toma en cuenta al montar).
  const [formKey, setFormKey] = useState(0);
  const [initialValues, setInitialValues] = useState<QuoteFormValues>();

  function handleDuplicate(values: QuoteFormValues) {
    setInitialValues(values);
    setFormKey((key) => key + 1);
    setTab("quote");
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Barra de título tipo terminal — la app es la herramienta de
          trabajo del desarrollador, no el documento que le entrega al
          cliente (ese es el PDF, con su propio estilo). */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-text-faint">
          ~/calculadora-tarifas
        </span>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-text">
            <span className="text-accent">$</span> calculadora-tarifas
          </h1>
          <p className="mt-1 text-sm text-text-soft">
            Arma la cotización, revisa el total en vivo y genera el PDF.
          </p>
        </header>

        <nav className="mb-6 flex flex-wrap gap-1 border-b border-border">
          {TABS.map(({ id, label }) => (
            <TabButton key={id} active={tab === id} onClick={() => setTab(id)}>
              {label}
            </TabButton>
          ))}
        </nav>

        {tab === "quote" && (
          <QuoteForm key={formKey} initialValues={initialValues} />
        )}
        {tab === "history" && (
          <Suspense fallback={<TabFallback>cargando historial…</TabFallback>}>
            <HistoryList onDuplicate={handleDuplicate} />
          </Suspense>
        )}
        {tab === "clients" && (
          <Suspense fallback={<TabFallback>cargando clientes…</TabFallback>}>
            <ClientsPage />
          </Suspense>
        )}
        {tab === "settings" && (
          <Suspense
            fallback={<TabFallback>cargando configuración…</TabFallback>}
          >
            <SettingsPage />
          </Suspense>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "-mb-px rounded-t border border-b-0 border-border bg-surface px-3.5 py-2 text-sm text-text"
          : "-mb-px rounded-t border border-b-0 border-transparent px-3.5 py-2 text-sm text-text-faint hover:text-text-soft"
      }
    >
      {children}
    </button>
  );
}

function TabFallback({ children }: { children: ReactNode }) {
  return <p className="text-sm text-text-soft">{children}</p>;
}

export default App;
