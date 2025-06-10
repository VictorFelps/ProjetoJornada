import express from 'express';
import cors from 'cors';
import { DataService } from './dataService';
import { JourneyService } from './journeyService';
import { ProcessedJourney } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middlewares
app.use(cors());
app.use(express.json());

// Serviços
const dataService = new DataService();
const journeyService = new JourneyService();

// Cache dos dados processados
let processedJourneys: ProcessedJourney[] = [];

// Carrega e processa os dados na inicialização
function initializeData() {
  try {
    console.log('Carregando dados...');
    const touchpoints = dataService.loadData();
    processedJourneys = journeyService.processJourneys(touchpoints);
    console.log(`Dados inicializados: ${processedJourneys.length} jornadas processadas`);
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
    process.exit(1);
  }
}

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Jornadas de Usuários',
    version: '1.0.0',
    endpoints: {
      journeys: '/journeys',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    totalJourneys: processedJourneys.length
  });
});

app.get('/journeys', (req, res) => {
  try {
    const { campaign, medium, content } = req.query;
    
    let filteredJourneys = processedJourneys;
    
    // Aplica filtros se fornecidos
    if (campaign || medium || content) {
      filteredJourneys = journeyService.filterJourneys(processedJourneys, {
        campaign: campaign as string,
        medium: medium as string,
        content: content as string
      });
    }
    
    // Estatísticas básicas
    const stats = {
      totalJourneys: filteredJourneys.length,
      averageTouchpoints: filteredJourneys.length > 0 
        ? filteredJourneys.reduce((sum, j) => sum + j.touchpointCount, 0) / filteredJourneys.length 
        : 0,
      uniqueChannels: new Set(filteredJourneys.flatMap(j => j.journey)).size
    };
    
    res.json({
      stats,
      journeys: filteredJourneys
    });
  } catch (error) {
    console.error('Erro ao buscar jornadas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Falha ao processar solicitação de jornadas'
    });
  }
});

// Endpoint para obter valores únicos para filtros
app.get('/filters', (req, res) => {
  try {
    const campaigns = new Set<string>();
    const mediums = new Set<string>();
    const contents = new Set<string>();
    
    processedJourneys.forEach(journey => {
      journey.touchpoints.forEach(tp => {
        if (tp.campaign) campaigns.add(tp.campaign);
        if (tp.medium) mediums.add(tp.medium);
        if (tp.content) contents.add(tp.content);
      });
    });
    
    res.json({
      campaigns: Array.from(campaigns).sort(),
      mediums: Array.from(mediums).sort(),
      contents: Array.from(contents).sort()
    });
  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Falha ao processar solicitação de filtros'
    });
  }
});

// Middleware de tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  });
});

// Inicializa os dados e inicia o servidor
initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

export default app;

