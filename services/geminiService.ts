
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { SoilNutrients, SpatialMetrics, IBGECNAE, IBGEUrbanAgglomeration, IBGEStatisticProduct, IBGEIndicator, IBGECountryIndicator, IBGEGeographicName } from "../types";

export class GeminiService {
  
  // Chat Padrão
  async chat(message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[] = [], thinking: boolean = false) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        systemInstruction: SYSTEM_PROMPT,
        temperature: thinking ? 1.0 : 0.7,
      };
      if (thinking) config.thinkingConfig = { thinkingBudget: 32768 };

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config,
      });
      return response.text;
    } catch (error) {
      return "Erro de conexão neural.";
    }
  }

  // Análise de Nome Geográfico (BNGB)
  async analyzeGeographicIdentity(geo: IBGEGeographicName) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise o seguinte marco geográfico oficial do IBGE localizado na região da fazenda:
      - Nome: ${geo.nome}
      - Categoria: ${geo.categoria}
      - Tipo: ${geo.tipo}
      - Local: ${geo.municipio}, ${geo.uf}
      
      Explique a relevância histórica ou ambiental deste nome para o agronegócio regional e o que ele pode indicar sobre a geografia local (relevo, hidrografia ou microclima).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Especialista em Geografia Física e Territorial Agrícola. Seja informativo, histórico e técnico.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise geográfica indisponível.";
    }
  }

  // Análise de Contexto Global (IBGE Países)
  async analyzeGlobalMarketContext(indicator: IBGECountryIndicator) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = indicator.series.slice(0, 5).map(s => {
        const lastYear = Object.keys(s.serie[0])[0];
        const val = s.serie[0][lastYear];
        return `${s.pais.nome}: ${val} ${indicator.unidade}`;
      }).join(', ');

      const prompt = `Analise o indicador global "${indicator.indicador}" (${summary}) no contexto do agronegócio brasileiro (especialmente soja).
      Explique como esses números internacionais podem afetar a exportação, o preço do frete ou a competitividade do produtor local em Rio Verde, GO.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Especialista em Comércio Exterior e Macrotendências Agro. Seja analítico, direto e estratégico.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise macroeconômica indisponível.";
    }
  }

  async transcribeAudio(base64Audio: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'audio/webm;codecs=opus', data: base64Audio } },
            { text: "Transcreva este áudio agrícola exatamente como falado. Não adicione comentários, introduções ou explicações. Retorne apenas o texto puro." }
          ]
        },
        config: {
          temperature: 0.1, // Baixa temperatura para transcrição literal
        }
      });
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Erro na transcrição Gemini:", error);
      return "";
    }
  }

  async analyzeIndicatorInsight(indicator: IBGEIndicator, researchName: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise o seguinte indicador da pesquisa "${researchName}" do IBGE:
      - Indicador: ${indicator.indicador}
      - Unidade: ${indicator.unidade?.classe || 'N/A'}
      
      Explique como o monitoramento deste indicador específico auxilia na resiliência financeira ou estratégica de uma fazenda de soja em Rio Verde.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Chief Strategy Officer (CSO) do agronegócio. Seja técnico, preditivo e sucinto.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise de indicador indisponível.";
    }
  }

  async analyzeIBGEStatistic(product: IBGEStatisticProduct) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise a importância desta pesquisa oficial do IBGE para um produtor de soja em Rio Verde, GO:
      - Pesquisa: ${product.nome} (${product.alias})
      - Descrição: ${product.descricao}
      
      Explique como os dados desta estatística podem influenciar a tomada de decisão sobre preços, estoque ou logística.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Analista de Inteligência de Mercado Agrícola. Responda de forma estratégica e executiva.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise estatística indisponível.";
    }
  }

  async analyzeTerritorialImpact(agglom: IBGEUrbanAgglomeration) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise o impacto para uma fazenda de soja em estar inserida ou próxima da aglomeração urbana: ${agglom.nome}.
      Considere:
      1. Logística e Escoamento.
      2. Disponibilidade de Mão de Obra Qualificada.
      3. Pressão de Urbanização e Valorização de Terra.
      4. Conexão com centros de tecnologia agro.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Especialista em Inteligência Territorial e Logística Agrícola. Seja estratégico e conciso.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise territorial indisponível.";
    }
  }

  async interpretCNAE(cnae: IBGECNAE) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise este enquadramento de atividade econômica (CNAE):
      - Descrição: ${cnae.descricao}
      - Seção: ${cnae.grupo.divisao.secao.descricao}
      - Divisão: ${cnae.grupo.divisao.descricao}
      
      Explique brevemente as implicações tributárias ou de crédito rural comuns para esta classe no Brasil.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Consultor Tributário e Regulatório Agrícola. Seja conciso e direto.",
        }
      });
      return response.text;
    } catch (error) {
      return "Análise regulatória indisponível.";
    }
  }

  async analyzeSpatialData(metrics: SpatialMetrics) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise estas métricas extraídas via Google Earth Engine (Sentinel-2):
      - NDVI: ${metrics.ndvi} (Vigor Vegetativo)
      - EVI: ${metrics.evi} (Índice de Vegetação Ajustado)
      - Umidade do Solo: ${metrics.soilMoisture}%
      - Temperatura de Superfície: ${metrics.surfaceTemp}°C
      - Timestamp: ${metrics.timestamp}
      
      Forneça um diagnóstico técnico curto e ações recomendadas.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Especialista em Sensoriamento Remoto Agrícola. Responda em tom técnico e direto.",
        }
      });
      return response.text;
    } catch (error) {
      return "Não foi possível interpretar os dados de satélite no momento.";
    }
  }

  async generateSoilPrescription(nutrients: SoilNutrients, targetYield: number) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise solo: pH ${nutrients.ph}, MO ${nutrients.mo}%, P ${nutrients.p}, K ${nutrients.k}. Alvo: ${targetYield} sc/ha.`,
        config: {
          systemInstruction: "Doutor em Solos. Gere plano em JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              soilStatus: { type: Type.STRING },
              limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
              plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timing: {type: Type.STRING}, product: {type: Type.STRING}, dosage: {type: Type.NUMBER}, unit: {type: Type.STRING}, rationale: {type: Type.STRING} } } },
              expectedYieldIncrease: { type: Type.NUMBER }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
  }

  async analyzeTextLinguistics(text: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: "Motor NLP. Extraia sentimento e entidades em JSON.",
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { sentiment: {type: Type.STRING}, score: {type: Type.NUMBER}, summary: {type: Type.STRING}, entities: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {text: {type: Type.STRING}, type: {type: Type.STRING}, importance: {type: Type.NUMBER}}}}, actionItems: {type: Type.ARRAY, items: {type: Type.STRING}}} }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
  }

  connectLive(callbacks: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: SYSTEM_PROMPT + "\nModo voz real-time.",
      },
    });
  }

  encodeAudio(data: Float32Array): string {
    const l = data.length; const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    const bytes = new Uint8Array(int16.buffer); let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  decodeAudio(base64: string): Uint8Array {
    const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  async createAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, sampleRate); const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  }

  async analyzeAgroImage(base64Image: string, mode: string = 'diagnostic') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: "Analise imagem agrícola JSON." }] },
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, description: {type: Type.STRING}, severity: {type: Type.NUMBER}, tags: {type: Type.ARRAY, items: {type: Type.STRING}}, detections: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {label: {type: Type.STRING}, location: {type: Type.STRING}}}}} } }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) { return null; }
  }

  async generateImage(prompt: string, aspectRatio: string) {
    try {
      const aiGen = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await aiGen.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" } }
      });
      for (const part of response.candidates[0].content.parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      return null;
    } catch (error) { return null; }
  }

  async searchMaps(query: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: query, config: { tools: [{ googleMaps: {} }] } });
      return { text: response.text, links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    } catch (error) { return { text: "Erro Maps.", links: [] }; }
  }

  async predictFertilizationImpact(type: string, dosage: number) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Impacto ${dosage}kg/ha de ${type}.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { healthScoreDelta: {type: Type.NUMBER}, yieldDelta: {type: Type.NUMBER}, technicalReasoning: {type: Type.STRING} } } } });
      return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
  }
}

export const geminiService = new GeminiService();
