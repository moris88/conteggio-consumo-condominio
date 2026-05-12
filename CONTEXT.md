# CONTEXT.md — Conteggio Consumo Acqua Condominio

## Scopo dell'applicazione

Web app client-side per **calcolare e ripartire i costi della bolletta dell'acqua condominiale** tra i condomini. Ogni condomino ha un proprio contatore; l'app calcola la quota individuale tenendo conto di:

- consumo effettivo per singolo appartamento
- quota fissa suddivisa in parti uguali
- ripartizione proporzionale di tutte le voci della bolletta (fasce di eccedenza, fogna, depurazione, IVA)
- gestione differenziata per proprietari non residenti (pagano solo quota fissa, IVA e spese postali)
- calcolo discrepanza tra contatore generale e somma contatori individuali

I dati sono persistiti nel `localStorage` del browser.

---

## Stack tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| UI | React 19, TypeScript |
| Build | Vite 6 |
| State | Zustand (con middleware `persist`) |
| CSS | TailwindCSS v4 |
| Icone | `iconoir-react` |
| Export | `html2canvas` + `jsPDF` (PDF), CSV |
| Test | Vitest |

---

## Struttura dei file

```
src/
  components/
    CondominiStep.tsx     # Step 1: Gestione condomini (Aggiungi/Modifica/Elimina)
    BollettaStep.tsx      # Step 2: Inserimento dati bolletta AQP
    ConsumiStep.tsx       # Step 3: Inserimento letture contatori individuali
    RisultatiStep.tsx     # Step 4: Visualizzazione tabella ripartizione e export
    ui/                   # Componenti UI atomici (Button, Card, Input, etc.)
  store/
    useAppStore.ts        # Stato globale con Zustand e persistenza
  types/
    index.ts              # Interfacce Condomino, BollettaAcqua, Risultato
  utils/
    calcoli.ts            # Core logic dei calcoli di ripartizione
    esporta.ts            # Funzioni per export PDF e CSV
  App.tsx                 # Layout principale e gestione Step
  main.tsx                # Entry point
```

---

## Logica di calcolo (`src/utils/calcoli.ts`)

1. **Consumo Reale**: Differenza tra lettura attuale e precedente del condomino.
2. **Consumo Proporzionale**: Il consumo "bolletta" viene ripartito tra i condomini residenti in base al loro consumo reale.
   `consumoTotale = (consumoBolletta * consumoReale) / consumoRealeTotale`
3. **Coefficiente**: `coeff = consumoTotale / consumoBolletta`
4. **Ripartizione Voci**: Ogni voce variabile della bolletta (Tariffa Agevolata, Eccedenze, Fogna, Depurazione, IVA, Rettifiche) viene moltiplicata per il `coeff` del condomino.
5. **Quote Fisse e Spese**: Divise equamente tra tutti i condomini.
6. **Proprietari Non Residenti**: Pagano solo `quotaFissa + 10% IVA + spesePostali`.

---

## Funzionalità principali

- **Workflow a step**: Guida l'utente dall'inserimento condomini all'export finale.
- **Persistenza**: I dati non vanno persi al refresh della pagina.
- **Discrepanza**: Segnala se la differenza tra contatore generale e letture individuali supera il 10%.
- **Export multiformato**: Genera PDF con anteprima o file CSV per Excel.
- **Reset**: Pulsante per azzerare tutti i dati e ricominciare.
