import { Touchpoint, ProcessedJourney } from './types';

export class JourneyService {
  
  /**
   * Agrupa touchpoints por sessionId
   */
  private groupBySession(touchpoints: Touchpoint[]): Map<string, Touchpoint[]> {
    const sessions = new Map<string, Touchpoint[]>();
    
    for (const touchpoint of touchpoints) {
      if (!sessions.has(touchpoint.sessionId)) {
        sessions.set(touchpoint.sessionId, []);
      }
      sessions.get(touchpoint.sessionId)!.push(touchpoint);
    }
    
    return sessions;
  }

  /**
   * Ordena touchpoints por data de criação
   */
  private sortByCreatedAt(touchpoints: Touchpoint[]): Touchpoint[] {
    return touchpoints.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  /**
   * Aplica regras de deduplicação:
   * - Primeiro e último canal podem se repetir
   * - No meio da jornada, cada canal deve aparecer apenas uma vez
   * - Mantém a primeira ocorrência em caso de duplicatas no meio
   */
  private deduplicateChannels(touchpoints: Touchpoint[]): Touchpoint[] {
    if (touchpoints.length <= 2) {
      return touchpoints; // Se tem 2 ou menos touchpoints, não precisa deduplificar
    }

    const result: Touchpoint[] = [];
    const seenChannels = new Set<string>();

    // Sempre adiciona o primeiro touchpoint
    result.push(touchpoints[0]);
    seenChannels.add(touchpoints[0].channel);

    // Processa touchpoints do meio (exceto primeiro e último)
    for (let i = 1; i < touchpoints.length - 1; i++) {
      const touchpoint = touchpoints[i];
      
      // Se o canal não foi visto antes, adiciona
      if (!seenChannels.has(touchpoint.channel)) {
        result.push(touchpoint);
        seenChannels.add(touchpoint.channel);
      }
      // Se já foi visto, pula (remove duplicata)
    }

    // Sempre adiciona o último touchpoint
    if (touchpoints.length > 1) {
      result.push(touchpoints[touchpoints.length - 1]);
    }

    return result;
  }

  /**
   * Processa uma sessão individual
   */
  private processSession(sessionId: string, touchpoints: Touchpoint[]): ProcessedJourney {
    // 1. Ordena por data
    const sortedTouchpoints = this.sortByCreatedAt(touchpoints);
    
    // 2. Aplica regras de deduplicação
    const deduplicatedTouchpoints = this.deduplicateChannels(sortedTouchpoints);
    
    // 3. Extrai a jornada (lista de canais)
    const journey = deduplicatedTouchpoints.map(tp => tp.channel);
    
    return {
      sessionId,
      journey,
      touchpoints: deduplicatedTouchpoints,
      touchpointCount: deduplicatedTouchpoints.length,
      firstTouchpoint: deduplicatedTouchpoints[0],
      lastTouchpoint: deduplicatedTouchpoints[deduplicatedTouchpoints.length - 1]
    };
  }

  /**
   * Processa todas as jornadas
   */
  public processJourneys(touchpoints: Touchpoint[]): ProcessedJourney[] {
    console.log(`Processando ${touchpoints.length} touchpoints...`);
    
    // Agrupa por sessão
    const sessionGroups = this.groupBySession(touchpoints);
    console.log(`Encontradas ${sessionGroups.size} sessões únicas`);
    
    // Processa cada sessão
    const processedJourneys: ProcessedJourney[] = [];
    
    for (const [sessionId, sessionTouchpoints] of sessionGroups) {
      const processedJourney = this.processSession(sessionId, sessionTouchpoints);
      processedJourneys.push(processedJourney);
    }
    
    console.log(`Processadas ${processedJourneys.length} jornadas`);
    return processedJourneys;
  }

  /**
   * Filtra jornadas por critérios opcionais
   */
  public filterJourneys(
    journeys: ProcessedJourney[], 
    filters: {
      campaign?: string;
      medium?: string;
      content?: string;
    }
  ): ProcessedJourney[] {
    return journeys.filter(journey => {
      // Verifica se algum touchpoint da jornada atende aos filtros
      return journey.touchpoints.some(tp => {
        if (filters.campaign && tp.campaign !== filters.campaign) return false;
        if (filters.medium && tp.medium !== filters.medium) return false;
        if (filters.content && tp.content !== filters.content) return false;
        return true;
      });
    });
  }
}

