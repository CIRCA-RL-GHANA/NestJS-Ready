import { Injectable, Logger } from '@nestjs/common';
import { AINlpService } from './ai-nlp.service';

export interface SearchHit {
  id:         string;
  entityType: string;
  score:      number;
  snippet?:   string;
}

export interface RankedResult {
  id:         string;
  entityType: string;
  score:      number;
}

/**
 * AISearchService — cross-module semantic search.
 *
 * Feature  : TF-IDF ranking (via AINlpService) + keyword extraction for
 *            suggestions + cosine re-ranking of pre-fetched DB candidates.
 * Usage    : Inject wherever you need semantic search across any entity type.
 */
@Injectable()
export class AISearchService {
  private readonly logger = new Logger(AISearchService.name);

  /** Runtime index: docKey → metadata. DocKey = `${entityType}:${id}` */
  private readonly meta = new Map<string, { entityType: string; id: string; text: string }>();

  constructor(private readonly nlpService: AINlpService) {}

  // ─── Indexing ────────────────────────────────────────────────────────────────

  /**
   * Index a single entity for later TF-IDF search.
   * Calling this does NOT reset other indexes — it adds to the running corpus.
   */
  indexEntity(entityType: string, id: string, text: string): void {
    const key = `${entityType}:${id}`;
    if (!this.meta.has(key)) {
      this.nlpService.indexDocument(key, text);
      this.meta.set(key, { entityType, id, text });
    }
  }

  /** Re-index a batch of documents at once; resets the underlying TF-IDF index. */
  indexBatch(docs: Array<{ entityType: string; id: string; text: string }>): void {
    this.nlpService.resetIndex();
    this.meta.clear();
    for (const d of docs) {
      const key = `${d.entityType}:${d.id}`;
      this.nlpService.indexDocument(key, d.text);
      this.meta.set(key, d);
    }
  }

  // ─── Search ───────────────────────────────────────────────────────────────────

  /**
   * Full-corpus TF-IDF search.
   * Optionally filter by entityType (e.g. 'product', 'update', 'order').
   */
  search(
    query: string,
    entityType?: string,
    topN = 20,
  ): SearchHit[] {
    const rawResults = this.nlpService.searchDocuments(query, topN * (entityType ? 4 : 1));

    return rawResults
      .filter(r => {
        if (!entityType) return true;
        return this.meta.get(r.id)?.entityType === entityType;
      })
      .slice(0, topN)
      .map(r => {
        const m = this.meta.get(r.id);
        const snippet = m?.text ? m.text.slice(0, 120) + (m.text.length > 120 ? '…' : '') : '';
        return {
          id:         m?.id ?? r.id,
          entityType: m?.entityType ?? 'unknown',
          score:      r.score,
          snippet,
        };
      });
  }

  /**
   * Re-rank a pre-fetched list of candidates using cosine similarity.
   * Use this when you already have DB results and want AI-powered re-ordering.
   */
  rankCandidates(
    query: string,
    candidates: Array<{ id: string; text: string; entityType?: string }>,
    topN = 20,
  ): RankedResult[] {
    const scored = candidates.map(c => ({
      id:         c.id,
      entityType: c.entityType ?? 'unknown',
      score:      this.nlpService.similarity(query, c.text),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  // ─── Suggestions ─────────────────────────────────────────────────────────────

  /**
   * Return keyword-based autocomplete suggestions from the query string.
   */
  suggestKeywords(query: string, topN = 8): string[] {
    return this.nlpService.extractKeywords(query, topN);
  }

  /**
   * Return entities detected in the query (for guided search chips).
   */
  extractQueryEntities(query: string) {
    const result = this.nlpService.detectIntent(query);
    return result.entities;
  }

  // ─── Multi-type ranked merge ──────────────────────────────────────────────────

  /**
   * Semantic search across a freshly provided set of typed documents.
   * Resets the internal TF-IDF index, indexes the documents, searches,
   * and returns typed hits. Safe for request-scoped searches.
   */
  searchDocuments(
    query: string,
    documents: Array<{ id: string; text: string; entityType?: string }>,
    topN = 20,
  ): SearchHit[] {
    // Build ephemeral index
    this.nlpService.resetIndex();
    const tempMeta = new Map<string, { id: string; entityType: string; text: string }>();
    for (const d of documents) {
      const key = `${d.entityType ?? 'doc'}:${d.id}`;
      this.nlpService.indexDocument(key, d.text);
      tempMeta.set(key, { id: d.id, entityType: d.entityType ?? 'doc', text: d.text });
    }

    const rawResults = this.nlpService.searchDocuments(query, topN);
    return rawResults.map(r => {
      const m = tempMeta.get(r.id);
      return {
        id:         m?.id ?? r.id,
        entityType: m?.entityType ?? 'doc',
        score:      r.score,
        snippet:    m?.text.slice(0, 120) ?? '',
      };
    });
  }
}
