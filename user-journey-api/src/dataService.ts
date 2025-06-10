import * as XLSX from 'xlsx';
import { parseISO } from 'date-fns';
import path from 'path';
import { RawTouchpoint, Touchpoint } from './types';

export class DataService {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../data/[Nemu]Basededados.xlsx');
  }

  /**
   * Lê o arquivo XLSX e retorna os dados brutos
   */
  public readExcelFile(): RawTouchpoint[] {
    try {
      const workbook = XLSX.readFile(this.dataPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const rawData: RawTouchpoint[] = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`Dados carregados: ${rawData.length} registros`);
      return rawData;
    } catch (error) {
      console.error('Erro ao ler arquivo XLSX:', error);
      throw new Error('Falha ao carregar dados do arquivo XLSX');
    }
  }

  /**
   * Converte dados brutos para o formato padronizado
   */
  public transformRawData(rawData: RawTouchpoint[]): Touchpoint[] {
    return rawData.map(item => ({
      channel: item.utm_source || 'unknown',
      campaign: item.utm_campaign || null,
      medium: item.utm_medium || null,
      content: item.utm_content || null,
      sessionId: item.sessionId,
      created_at: parseISO(item.createdAt)
    }));
  }

  /**
   * Carrega e transforma todos os dados
   */
  public loadData(): Touchpoint[] {
    const rawData = this.readExcelFile();
    return this.transformRawData(rawData);
  }
}

