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
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Calculadora de Tarifas</h1>
            <p className="text-sm text-neutral-500">
              Arma la cotización del proyecto y revisa el total en tiempo real.
            </p>
          </div>
          <nav className="flex gap-2">
            <TabButton active={tab === "quote"} onClick={() => setTab("quote")}>
              Nueva cotización
            </TabButton>
            <TabButton
              active={tab === "history"}
              onClick={() => setTab("history")}
            >
              Historial
            </TabButton>
            <TabButton
              active={tab === "clients"}
              onClick={() => setTab("clients")}
            >
              Clientes
            </TabButton>
            <TabButton
              active={tab === "settings"}
              onClick={() => setTab("settings")}
            >
              Configuración
            </TabButton>
          </nav>
        </header>

        {tab === "quote" && (
          <QuoteForm key={formKey} initialValues={initialValues} />
        )}
        {tab === "history" && (
          <Suspense
            fallback={
              <p className="text-sm text-neutral-500">Cargando historial…</p>
            }
          >
            <HistoryList onDuplicate={handleDuplicate} />
          </Suspense>
        )}
        {tab === "clients" && (
          <Suspense
            fallback={
              <p className="text-sm text-neutral-500">Cargando clientes…</p>
            }
          >
            <ClientsPage />
          </Suspense>
        )}
        {tab === "settings" && (
          <Suspense
            fallback={
              <p className="text-sm text-neutral-500">
                Cargando configuración…
              </p>
            }
          >
            <SettingsPage />
          </Suspense>
        )}
      </div>
    </main>
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
          ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
          : "rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
      }
    >
      {children}
    </button>
  );
}

export default App;
