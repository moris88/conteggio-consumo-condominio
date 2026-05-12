import type {
  BollettaAcqua,
  Condomino,
  RigaRisultato,
  RisultatoCalcolo,
  TotaliRisultato,
} from "@/types";

/**
 * Calcola il consumo rilevato dal contatore del singolo condomino.
 */
export function getConsumoReale(c: Condomino): number {
  return Math.max(0, c.letturaAttuale - c.letturaPrecedente);
}

/**
 * Calcola la discrepanza tra il contatore generale e la somma dei sottocontatori.
 */
export function calcolaDiscrepanza(
  consumoRealeTotale: number,
  consumoBolletta: number,
  soglia = 10,
): {
  discrepanzaMC: number;
  discrepanzaPercent: number;
  discrepanzaElevata: boolean;
} {
  const discrepanzaMC = consumoBolletta - consumoRealeTotale;
  const discrepanzaPercent =
    consumoBolletta > 0 ? (Math.abs(discrepanzaMC) / consumoBolletta) * 100 : 0;
  const roundedPercent = Math.round(discrepanzaPercent * 100) / 100;
  return {
    discrepanzaMC,
    discrepanzaPercent: roundedPercent,
    discrepanzaElevata: roundedPercent > soglia,
  };
}

/**
 * Funzione core per la ripartizione selettiva delle eccedenze.
 * Se nessuno supera la soglia, il costo viene spalmato su tutti (fallback).
 */
function ripartisciVoce(
  consumoRealeCondomino: number,
  sogliaMinima: number,
  sommaConsumiSopraSoglia: number,
  valoreInBolletta: number,
  coeffProporzionaleGenerale: number,
): number {
  if (valoreInBolletta <= 0) return 0;

  // Se esiste qualcuno sopra soglia, ripartiamo solo tra loro
  if (sommaConsumiSopraSoglia > 0) {
    return consumoRealeCondomino > sogliaMinima
      ? (valoreInBolletta * consumoRealeCondomino) / sommaConsumiSopraSoglia
      : 0;
  }

  // Fallback: se la bolletta ha un costo ma nessuno è sopra soglia (es. perdite),
  // ripartiamo in base al consumo reale generale.
  return valoreInBolletta * coeffProporzionaleGenerale;
}

export function calcolaRisultati(
  condomini: Condomino[],
  bolletta: BollettaAcqua,
): RisultatoCalcolo {
  const nCondomini = condomini.length;
  const residenti = condomini.filter(
    (c) => c.tipo !== "proprietario-non-residente",
  );

  // 1. Calcolo del consumo reale totale (solo residenti)
  const consumoRealeTotale = residenti.reduce(
    (sum, c) => sum + getConsumoReale(c),
    0,
  );

  // 2. Calcolo dei denominatori per ogni fascia di eccedenza
  // Sommiamo i consumi solo di chi effettivamente supera la soglia della fascia
  const sommeSopraSoglia = {
    agevolata: residenti.reduce((acc, c) => {
      const cons = getConsumoReale(c);
      return acc + (cons > bolletta.tariffaAgevolataMin ? cons : 0);
    }, 0),
    base: residenti.reduce((acc, c) => {
      const cons = getConsumoReale(c);
      return acc + (cons > bolletta.eccedenzaBaseMin ? cons : 0);
    }, 0),
    f1: residenti.reduce((acc, c) => {
      const cons = getConsumoReale(c);
      return acc + (cons > bolletta.eccedenzaFascia1Min ? cons : 0);
    }, 0),
    f2: residenti.reduce((acc, c) => {
      const cons = getConsumoReale(c);
      return acc + (cons > bolletta.eccedenzaFascia2Min ? cons : 0);
    }, 0),
    f3: residenti.reduce((acc, c) => {
      const cons = getConsumoReale(c);
      return acc + (cons > bolletta.eccedenzaFascia3Min ? cons : 0);
    }, 0),
  };

  // 3. Elaborazione delle singole righe
  const righe: RigaRisultato[] = condomini.map((condomino) => {
    const isNonResidente = condomino.tipo === "proprietario-non-residente";
    const consumoReale = getConsumoReale(condomino);
    const n = Math.max(1, nCondomini);

    // Quote fisse divise per testa
    const quotaFissa = bolletta.quotaFissa / n;
    const spesePostali = bolletta.spesePostali / n;
    const speseGestione = bolletta.speseGestione / n;

    if (isNonResidente) {
      const iva = quotaFissa * 0.1; // IVA fissa 10% per non residenti
      const totaleFatturaAQP = quotaFissa + iva;
      return {
        condomino,
        consumoReale: 0,
        consumoTotale: 0,
        coeffProporzionale: 0,
        quotaFissa,
        tariffaAgevolata: 0,
        eccedenzaBase: 0,
        eccedenzaFascia1: 0,
        eccedenzaFascia2: 0,
        eccedenzaFascia3: 0,
        quotaFogna: 0,
        quotaDepurazione: 0,
        quotaPerequazione: 0,
        totaleParziale: quotaFissa,
        iva,
        rettificaAcconti: 0,
        totaleFatturaAQP,
        spesePostali,
        speseGestione: 0,
        totaleDaPagare: totaleFatturaAQP + spesePostali,
        isNonResidente: true,
      };
    }

    // --- LOGICA RESIDENTI ---
    const coeff =
      consumoRealeTotale > 0 ? consumoReale / consumoRealeTotale : 0;

    // Calcolo eccedenze con verifica soglia
    const tariffaAgevolata = ripartisciVoce(
      consumoReale,
      bolletta.tariffaAgevolataMin,
      sommeSopraSoglia.agevolata,
      bolletta.tariffaAgevolata,
      coeff,
    );
    const eccedenzaBase = ripartisciVoce(
      consumoReale,
      bolletta.eccedenzaBaseMin,
      sommeSopraSoglia.base,
      bolletta.eccedenzaBase,
      coeff,
    );
    const eccedenzaFascia1 = ripartisciVoce(
      consumoReale,
      bolletta.eccedenzaFascia1Min,
      sommeSopraSoglia.f1,
      bolletta.eccedenzaFascia1,
      coeff,
    );
    const eccedenzaFascia2 = ripartisciVoce(
      consumoReale,
      bolletta.eccedenzaFascia2Min,
      sommeSopraSoglia.f2,
      bolletta.eccedenzaFascia2,
      coeff,
    );
    const eccedenzaFascia3 = ripartisciVoce(
      consumoReale,
      bolletta.eccedenzaFascia3Min,
      sommeSopraSoglia.f3,
      bolletta.eccedenzaFascia3,
      coeff,
    );

    // Voci proporzionali al consumo totale
    const quotaFogna = bolletta.quotaFogna * coeff;
    const quotaDepurazione = bolletta.quotaDepurazione * coeff;
    const quotaPerequazione = bolletta.quotaPerequazione * coeff;
    const iva = bolletta.iva * coeff;
    const rettificaAcconti = bolletta.rettificaAcconti * coeff;

    const totaleParziale =
      quotaFissa +
      tariffaAgevolata +
      eccedenzaBase +
      eccedenzaFascia1 +
      eccedenzaFascia2 +
      eccedenzaFascia3 +
      quotaFogna +
      quotaDepurazione +
      quotaPerequazione;

    const totaleFatturaAQP = totaleParziale + iva - rettificaAcconti;

    return {
      condomino,
      consumoReale,
      consumoTotale: Math.round(bolletta.consumoTotale * coeff),
      coeffProporzionale: coeff,
      quotaFissa,
      tariffaAgevolata,
      eccedenzaBase,
      eccedenzaFascia1,
      eccedenzaFascia2,
      eccedenzaFascia3,
      quotaFogna,
      quotaDepurazione,
      quotaPerequazione,
      totaleParziale,
      iva,
      rettificaAcconti,
      totaleFatturaAQP,
      spesePostali,
      speseGestione,
      totaleDaPagare: totaleFatturaAQP + spesePostali + speseGestione,
      isNonResidente: false,
    };
  });

  // 4. Calcolo dei totali generali per il riepilogo
  const totali = righe.reduce<TotaliRisultato>(
    (acc, r) => ({
      consumoReale: acc.consumoReale + r.consumoReale,
      consumoTotale: acc.consumoTotale + r.consumoTotale,
      quotaFissa: acc.quotaFissa + r.quotaFissa,
      tariffaAgevolata: acc.tariffaAgevolata + r.tariffaAgevolata,
      eccedenzaBase: acc.eccedenzaBase + r.eccedenzaBase,
      eccedenzaFascia1: acc.eccedenzaFascia1 + r.eccedenzaFascia1,
      eccedenzaFascia2: acc.eccedenzaFascia2 + r.eccedenzaFascia2,
      eccedenzaFascia3: acc.eccedenzaFascia3 + r.eccedenzaFascia3,
      quotaFogna: acc.quotaFogna + r.quotaFogna,
      quotaDepurazione: acc.quotaDepurazione + r.quotaDepurazione,
      quotaPerequazione: acc.quotaPerequazione + r.quotaPerequazione,
      totaleParziale: acc.totaleParziale + r.totaleParziale,
      iva: acc.iva + r.iva,
      rettificaAcconti: acc.rettificaAcconti + r.rettificaAcconti,
      totaleFatturaAQP: acc.totaleFatturaAQP + r.totaleFatturaAQP,
      spesePostali: acc.spesePostali + r.spesePostali,
      speseGestione: acc.speseGestione + r.speseGestione,
      totaleDaPagare: acc.totaleDaPagare + r.totaleDaPagare,
    }),
    {
      consumoReale: 0,
      consumoTotale: 0,
      quotaFissa: 0,
      tariffaAgevolata: 0,
      eccedenzaBase: 0,
      eccedenzaFascia1: 0,
      eccedenzaFascia2: 0,
      eccedenzaFascia3: 0,
      quotaFogna: 0,
      quotaDepurazione: 0,
      quotaPerequazione: 0,
      totaleParziale: 0,
      iva: 0,
      rettificaAcconti: 0,
      totaleFatturaAQP: 0,
      spesePostali: 0,
      speseGestione: 0,
      totaleDaPagare: 0,
    },
  );

  const { discrepanzaMC, discrepanzaPercent, discrepanzaElevata } =
    calcolaDiscrepanza(
      consumoRealeTotale,
      bolletta.consumoTotale,
      bolletta.sogliaDiscrepanza,
    );

  return {
    righe,
    consumoRealeTotale,
    consumoBolletta: bolletta.consumoTotale,
    discrepanzaMC,
    discrepanzaPercent,
    discrepanzaElevata,
    totali,
  };
}

// Utility di formattazione
export function fmt(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace(".", ",");
}

export function fmtEur(value: number): string {
  return `${fmt(value)} €`;
}

export function fmtMc(value: number): string {
  return `${fmt(value, 0)} mc`;
}
