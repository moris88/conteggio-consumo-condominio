# CONTEXT.md — Conteggio Consumo Acqua e Luce Condominio

## Scopo dell'applicazione

Web app client-side per **calcolare e ripartire i costi delle bollette condominiali** (acqua e luce scale) tra i condomini.

- **Acqua**: Ripartizione complessa basata su consumo effettivo, quote fisse, fasce di eccedenza e gestione non residenti.
- **Luce Scale**: Ripartizione equa (divisione in parti uguali) del totale bolletta, spese postali e spese di gestione.

I dati sono persistiti nel `localStorage` del browser separatamente per tipologia.

---

## Stack tecnologico

| Categoria | Tecnologia |
|-|-|
| UI | React 19, TypeScript |
| Build | Vite 6 |
| State | Zustand (con middleware `persist`) |
| CSS | TailwindCSS v4 |
| Icone | `iconoir-react` |
| Export | `modern-screenshot` + `jsPDF` (PDF), CSV |
| Test | Vitest |

---

## Struttura dei file

```txt
src/
  components/
    CondominiStep.tsx     # Step 1: Gestione condomini (Aggiungi/Modifica/Elimina)
    BollettaStep.tsx      # Step 2 (Acqua): Inserimento dati bolletta AQP
    BollettaLuceStep.tsx  # Step 2 (Luce): Inserimento dati bolletta Luce
    ConsumiStep.tsx       # Step 3 (Solo Acqua): Inserimento letture contatori
    RisultatiStep.tsx     # Step Finale: Visualizzazione tabella ripartizione e export
    ui/                   # Componenti UI atomici (Button, Card, Input, etc.)
  store/
    useAppStore.ts        # Stato globale con Zustand e persistenza
  types/
    index.ts              # Interfacce Condomino, Bolletta, Risultato
  utils/
    calcoli.ts            # Core logic dei calcoli di ripartizione
    esporta.ts            # Funzioni per export PDF e CSV
  App.tsx                 # Layout principale e gestione Step
  main.tsx                # Entry point
```

---

## Logica di calcolo (`src/utils/calcoli.ts`)

### Acqua

1. **Consumo Reale**: Differenza tra lettura attuale e precedente del condomino.
2. **Consumo Proporzionale**: Il consumo "bolletta" viene ripartito tra i condomini residenti in base al loro consumo reale.
3. **Ripartizione Voci**: Ogni voce variabile viene moltiplicata per il coefficiente del condomino.
4. **Non Residenti**: Pagano solo `quotaFissa + 10% IVA + spesePostali`.

### Luce Scale

1. **Ripartizione Equa**: `(Totale Bolletta + Spese Postali + Spese Gestione) / Numero Condomini`.
2. Tutte le voci sono divise equamente tra tutti i condomini inseriti.

---

## Funzionalità principali

- **Switch Acqua/Luce**: Gestione separata delle due utenze.
- **Workflow a step**: Guida l'utente dall'inserimento condomini all'export finale.
- **Persistenza**: I dati non vanno persi al refresh della pagina.
- **Export multiformato**: Genera PDF con anteprima o file CSV per Excel.
- **Reset**: Pulsante per azzerare tutti i dati e ricominciare.

---
