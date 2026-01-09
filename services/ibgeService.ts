
import { IBGECNAE, IBGEUrbanAgglomeration, IBGEStatisticProduct, IBGEIndicator, IBGECountryIndicator, IBGEGeographicName } from '../types';

export const ibgeService = {
  fetchCNAE: async (classeId: string): Promise<IBGECNAE | null> => {
    try {
      const cleanId = classeId.replace(/\D/g, '');
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v2/cnae/classes/${cleanId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar CNAE no IBGE:", error);
      return null;
    }
  },

  fetchUrbanAgglomerations: async (): Promise<IBGEUrbanAgglomeration[]> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/aglomeracoes-urbanas`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar aglomerações urbanas:", error);
      return [];
    }
  },

  fetchUrbanAgglomerationDetail: async (id: number): Promise<IBGEUrbanAgglomeration | null> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/aglomeracoes-urbanas/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar detalhe da aglomeração urbana:", error);
      return null;
    }
  },

  fetchStatistics: async (): Promise<IBGEStatisticProduct[]> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/produtos/estatisticas`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.slice(0, 20);
    } catch (error) {
      console.error("Erro ao buscar estatísticas IBGE:", error);
      return [];
    }
  },

  fetchIndicators: async (pesquisaId: number, posicao: string = '0'): Promise<IBGEIndicator[]> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/pesquisas/${pesquisaId}/indicadores/${posicao}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar indicadores da pesquisa ${pesquisaId}:`, error);
      return [];
    }
  },

  fetchCountryIndicators: async (indicatorIds: string): Promise<IBGECountryIndicator[]> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/paises/indicadores/${indicatorIds}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar indicadores de países:", error);
      return [];
    }
  },

  fetchGeographicName: async (id: string): Promise<IBGEGeographicName | null> => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/bngb/nomegeografico/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar nome geográfico no BNGB:", error);
      return null;
    }
  }
};
