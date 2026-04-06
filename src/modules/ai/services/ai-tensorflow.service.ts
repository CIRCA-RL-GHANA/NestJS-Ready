import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

// Imported conditionally so the app starts normally when TF is disabled
// or when the native binary is absent (CI environments, M-series Macs, etc.)
type TFType = typeof import('@tensorflow/tfjs-node');
let tf: TFType | null = null;

export interface TFPredictResult {
  /** 2-D array of prediction values [samples × outputs] */
  values: number[][];
  modelName: string;
  inferenceMs: number;
}

/**
 * AITensorflowService
 *
 * Manages the TensorFlow.js (tfjs-node) lifecycle alongside OpenAI:
 *  - Loads SavedModel / LayersModel bundles from `ml-models/<name>/model.json` at startup
 *  - Provides `predict()` for generic tensor inference
 *  - Provides `cosineSimilarity()` using TF ops (falls back to pure-JS when disabled)
 *  - Exposes `isEnabled()` / `hasModel()` guards so callers degrade gracefully
 *
 * Activation: set TENSORFLOW_ENABLED=true in .env
 * Model placement: add SavedModel directories under ml-models/<modelName>/model.json
 */
@Injectable()
export class AITensorflowService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AITensorflowService.name);
  private readonly models = new Map<
    string,
    import('@tensorflow/tfjs-node').LayersModel | import('@tensorflow/tfjs-node').GraphModel
  >();
  private enabled = false;

  constructor(private readonly configService: ConfigService) {}

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    this.enabled = this.configService.get<boolean>('ai.tensorflowEnabled') ?? false;

    if (!this.enabled) {
      this.logger.log('TensorFlow disabled (TENSORFLOW_ENABLED=false) — OpenAI-only mode');
      return;
    }

    try {
      tf = await import('@tensorflow/tfjs-node');
      this.logger.log(`TensorFlow.js ${tf.version.tfjs} (tfjs-node CPU) initialised`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to load @tensorflow/tfjs-node (${msg}) — falling back to OpenAI-only mode`,
      );
      this.enabled = false;
      return;
    }

    await this.preloadModels();
  }

  async onModuleDestroy(): Promise<void> {
    for (const [name, model] of this.models) {
      try {
        model.dispose();
        this.logger.debug(`TF model disposed: ${name}`);
      } catch {
        // best-effort cleanup
      }
    }
    this.models.clear();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /** Returns true only when TF is enabled AND the native binary loaded without error. */
  isEnabled(): boolean {
    return this.enabled && tf !== null;
  }

  /** Returns true when the named model is loaded and ready for inference. */
  hasModel(name: string): boolean {
    return this.models.has(name);
  }

  /** Names of all currently-loaded models. */
  loadedModels(): string[] {
    return [...this.models.keys()];
  }

  /**
   * Run inference on a named model.
   *
   * @param modelName  Model directory name under ml-models/ (e.g. "fraud", "pricing")
   * @param input      2-D array [samples × features]; shape must match the model's input layer
   * @returns          Prediction values; empty when TF is disabled or model not found
   */
  async predict(modelName: string, input: number[][]): Promise<TFPredictResult> {
    if (!this.isEnabled()) {
      return { values: [], modelName, inferenceMs: 0 };
    }

    const model = this.models.get(modelName);
    if (!model) {
      this.logger.warn(`TF model "${modelName}" not loaded — skipping TF prediction`);
      return { values: [], modelName, inferenceMs: 0 };
    }

    const start = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tfAny = tf as any;
    const inputTensor = tfAny.tensor2d(input);
    try {
      const out = (model as any).predict(inputTensor);
      // predict() may return a Tensor or Tensor[] — handle both
      const outputTensor = Array.isArray(out) ? out[0] : out;
      const values = (await outputTensor.array()) as number[][];
      outputTensor.dispose();
      return { values, modelName, inferenceMs: Date.now() - start };
    } finally {
      inputTensor.dispose();
    }
  }

  /**
   * Load a model on-demand (outside of the automatic preload on init).
   *
   * @param name       Logical key for later retrieval via predict() / hasModel()
   * @param modelPath  Absolute path to `model.json` (LayersModel or GraphModel)
   */
  async loadModel(name: string, modelPath: string): Promise<boolean> {
    if (!this.isEnabled() || !tf) return false;

    // Try LayersModel first (Keras-style), then GraphModel (TF SavedModel converted)
    try {
      const model = await tf.loadLayersModel(`file://${modelPath}`);
      this.models.set(name, model);
      this.logger.log(`TF LayersModel loaded: "${name}" from ${modelPath}`);
      return true;
    } catch {
      try {
        const model = await tf.loadGraphModel(`file://${modelPath}`);
        this.models.set(name, model);
        this.logger.log(`TF GraphModel loaded: "${name}" from ${modelPath}`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to load TF model "${name}" from ${modelPath}: ${msg}`);
        return false;
      }
    }
  }

  /**
   * Compute cosine similarity between two 1-D vectors.
   * Uses TF ops when enabled for hardware acceleration; falls back to pure-JS otherwise.
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (!this.isEnabled() || !tf || a.length === 0 || b.length === 0) {
      return this.jsCosineSimilarity(a, b);
    }

    const ta = tf.tensor1d(a);
    const tb = tf.tensor1d(b);
    try {
      const dot = ta.dot(tb).dataSync()[0];
      const normA = ta.norm().dataSync()[0];
      const normB = tb.norm().dataSync()[0];
      if (normA === 0 || normB === 0) return 0;
      return dot / (normA * normB);
    } finally {
      ta.dispose();
      tb.dispose();
    }
  }

  /**
   * Batch cosine similarity: score each row of `candidates` against `query`.
   * Uses a single TF matrix-vector multiply when TF is enabled.
   *
   * @param query       1-D feature vector
   * @param candidates  2-D matrix [n × features]
   * @returns           1-D similarity scores [n]
   */
  batchCosineSimilarity(query: number[], candidates: number[][]): number[] {
    if (!this.isEnabled() || !tf || candidates.length === 0) {
      return candidates.map((c) => this.jsCosineSimilarity(query, c));
    }

    const qTensor = tf.tensor1d(query);
    const cTensor = tf.tensor2d(candidates);
    try {
      const qNorm = qTensor.norm();
      const cNorm = cTensor.norm('euclidean', 1, true); // per-row norms [n×1]
      const dots = cTensor.matMul(qTensor.reshape([-1, 1])); // [n×1]
      const denom = cNorm.mul(qNorm);
      const scores = dots.div(denom.add(1e-8)).squeeze([1]);
      return Array.from(scores.dataSync());
    } finally {
      qTensor.dispose();
      cTensor.dispose();
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Scan ml-models/ for subdirectories containing a `model.json` and load each one.
   * Expected layout:
   *   ml-models/
   *     fraud/model.json
   *     pricing/model.json
   *     recommendations/model.json
   */
  private async preloadModels(): Promise<void> {
    const modelDir = this.configService.get<string>('ai.modelPath') ?? './ml-models';
    const absDir = path.resolve(modelDir);

    if (!fs.existsSync(absDir)) {
      this.logger.warn(
        `TF ml-models directory not found at "${absDir}" — no models preloaded. ` +
          'Create ml-models/<name>/model.json to enable local inference.',
      );
      return;
    }

    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    let loaded = 0;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const modelJsonPath = path.join(absDir, entry.name, 'model.json');
      if (!fs.existsSync(modelJsonPath)) continue;

      const ok = await this.loadModel(entry.name, modelJsonPath);
      if (ok) loaded++;
    }

    this.logger.log(
      loaded > 0
        ? `TensorFlow: ${loaded} model(s) preloaded from "${absDir}"`
        : `TensorFlow enabled — no models found in "${absDir}". ` +
            'Place SavedModel or Keras model directories under ml-models/ to use local inference.',
    );
  }

  /** Pure-JS cosine similarity fallback (no TF dependency). */
  private jsCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
