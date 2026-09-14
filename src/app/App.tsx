import { QuoteForm } from "../features/quote/QuoteForm";

function App() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Calculadora de Tarifas</h1>
          <p className="text-sm text-neutral-500">
            Arma la cotización del proyecto y revisa el total en tiempo real.
          </p>
        </header>

        <QuoteForm />
      </div>
    </main>
  );
}

export default App;
