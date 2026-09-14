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
  { id: "quote", label: "Nueva cotización" },
  { id: "history", label: "Historial" },
  { id: "clients", label: "Clientes" },
  { id: "settings", label: "Configuración" },
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
    <div className="min-h-screen bg-paper text-ink">
      <div className="h-1.5 bg-accent" />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-ink-faint">
              herramienta de cotización
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Calculadora de Tarifas
            </h1>
          </div>
          <p className="max-w-xs text-sm text-ink-soft">
            Arma la cotización, revisa el total en vivo y genera el PDF listo
            para enviar.
          </p>
        </header>

        <nav className="mb-8 flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
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
          <Suspense fallback={<TabFallback>Cargando historial…</TabFallback>}>
            <HistoryList onDuplicate={handleDuplicate} />
          </Suspense>
        )}
        {tab === "clients" && (
          <Suspense fallback={<TabFallback>Cargando clientes…</TabFallback>}>
            <ClientsPage />
          </Suspense>
        )}
        {tab === "settings" && (
          <Suspense
            fallback={<TabFallback>Cargando configuración…</TabFallback>}
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
          ? "border-b-2 border-accent pb-3 text-sm font-medium text-ink"
          : "border-b-2 border-transparent pb-3 text-sm font-medium text-ink-soft hover:text-ink"
      }
    >
      {children}
    </button>
  );
}

function TabFallback({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-soft">{children}</p>;
}

export default App;
