# Conteggio Consumo Acqua e Luce Condominio

Web app client-side per il calcolo e la ripartizione equa dei costi delle bollette (acqua e luce scale) tra i condomini.

## 🚀 Scopo dell'applicazione

L'applicazione permette di gestire la ripartizione delle spese condominiali in modo trasparente. Supporta due modalità principali:

### 💧 Bolletta Acqua

Ripartizione per bollette AQP (Acquedotto Pugliese) o simili, dove ogni condomino possiede un proprio contatore. Il calcolo tiene conto di:

- **Consumo effettivo**: Differenza tra letture contatori.
- **Ripartizione proporzionale**: Voci variabili ripartite in base al consumo reale dei residenti.
- **Residenti vs Non Residenti**: Gestione differenziata automatica.
- **Controllo discrepanza**: Segnala differenze anomale tra contatore generale e somma dei singoli.

### 💡 Luce Scale

Ripartizione semplificata per le spese comuni della luce scale o simili:

- **Ripartizione equa**: Il totale della bolletta e le spese accessorie vengono divise in parti uguali tra tutti i condomini.
- **Gestione spese**: Include voci per commissioni postali e spese di gestione.

## 🛠️ Stack Tecnologico

- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 6
- **Stato**: Zustand (con persistenza in `localStorage`)
- **Styling**: TailwindCSS v4
- **Export**: `modern-screenshot` + `jsPDF` (per PDF) e CSV nativo
- **Test**: Vitest

## 📂 Struttura del Progetto

```text
src/
  components/
    CondominiStep.tsx     # Gestione anagrafica condomini
    BollettaStep.tsx      # Configurazione bolletta Acqua
    BollettaLuceStep.tsx  # Configurazione bolletta Luce
    ConsumiStep.tsx       # Inserimento letture (Solo Acqua)
    RisultatiStep.tsx     # Tabella ripartizione ed export
    ui/                   # Componenti atomici
  store/
    useAppStore.ts        # Gestione stato globale
  utils/
    calcoli.ts            # Logica dei calcoli (Acqua e Luce)
    esporta.ts            # Utility per export PDF e CSV
```

## 📦 Installazione e Sviluppo

```bash
# Installazione dipendenze
pnpm install

# Avvio in modalità sviluppo
pnpm dev

# Esecuzione test e coverage
pnpm test
pnpm test:coverage
```

## ✅ Test e Qualità

La soglia minima di coverage richiesta è del **70%**.
