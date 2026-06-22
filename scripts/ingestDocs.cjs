#!/usr/bin/env node

/**
 * MarketMind AI — Local Knowledge Ingestion (Native GCP)
 *
 * Reads local knowledge articles from ./docs, splits them into chunks,
 * generates 768-dimension Google Gemini embeddings (text-embedding-004),
 * and writes each chunk natively to the Firestore `market_intelligence_rag`
 * collection in the `marketmind-ai-website` project.
 *
 * No firebase-admin. No OpenAI. No web crawling. Local docs only.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const { Firestore, FieldValue } = require('@google-cloud/firestore');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

// --- Configuration ----------------------------------------------------------
const GCP_PROJECT_ID = 'marketmind-ai-website';
const FIRESTORE_COLLECTION = 'market_intelligence_rag';

// Local markdown/text articles live exclusively in this directory.
const DOCS_ROOT = path.resolve(__dirname, '..', 'docs');

// Accepted local article extensions.
const ACCEPTED_EXTENSIONS = new Set(['.md', '.txt']);

// Current Gemini embedding model. text-embedding-004 is retired; gemini-embedding-001
// defaults to 3072 dimensions, so we request outputDimensionality=768 explicitly.
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_API_VERSION = 'v1beta';
const EXPECTED_DIMENSIONS = 768;

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

// --- Logging helper ---------------------------------------------------------
function logBanner(title) {
  console.log('\n============================================================');
  console.log(title);
  console.log('============================================================');
}

// --- PHASE 1: Discover local article files ----------------------------------
function isAcceptedArticle(fileName) {
  return ACCEPTED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function discoverArticleFiles() {
  logBanner('PHASE 1: Discover Local Knowledge Articles');

  let entries;
  try {
    entries = await fsp.readdir(DOCS_ROOT, { withFileTypes: true });
  } catch (error) {
    console.error(`[Discovery] Failed reading docs directory ${DOCS_ROOT}:`, error.message);
    return [];
  }

  const files = entries
    .filter((entry) => entry.isFile() && isAcceptedArticle(entry.name))
    .map((entry) => path.join(DOCS_ROOT, entry.name))
    .sort((a, b) => a.localeCompare(b));

  console.log(`[Discovery] Scanning: ${DOCS_ROOT}`);
  console.log(`[Discovery] Found ${files.length} article file(s).`);
  for (const filePath of files) {
    console.log(`[Discovery] -> ${path.basename(filePath)}`);
  }

  return files;
}

// --- PHASE 2: Load and chunk articles ---------------------------------------
async function loadAndChunkArticles(textSplitter) {
  logBanner('PHASE 2: Parse and Chunk Local Articles');

  const articleFiles = await discoverArticleFiles();
  const chunks = [];

  for (const filePath of articleFiles) {
    const filename = path.basename(filePath);

    try {
      console.log(`[Article] Reading ${filename}`);
      const rawText = await fsp.readFile(filePath, 'utf8');

      if (!rawText || !rawText.trim()) {
        console.warn(`[Article] Skipping empty file ${filename}`);
        continue;
      }

      const splitTexts = await textSplitter.splitText(rawText);
      console.log(`[Article] ${filename} produced ${splitTexts.length} chunk(s).`);

      for (const splitText of splitTexts) {
        chunks.push({
          content: splitText,
          metadata: {
            source: filename,
            category: 'market_intelligence'
          }
        });
      }
    } catch (error) {
      console.error(`[Article] Failed processing ${filename}:`, error.message);
    }
  }

  console.log(`[Article] Total chunks accumulated: ${chunks.length}`);
  return chunks;
}

// --- PHASE 3A: Initialize native GCP Firestore ------------------------------
function initializeFirestore() {
  logBanner('PHASE 3A: Initialize Native GCP Firestore');

  const db = new Firestore({
    projectId: GCP_PROJECT_ID
  });

  console.log(`[Firestore] Initialized native client against project ${GCP_PROJECT_ID}.`);
  return db;
}

// --- PHASE 3B: Initialize Gemini embeddings ---------------------------------
function initializeEmbeddingsModel() {
  logBanner('PHASE 3B: Initialize Gemini Embeddings Model');

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY (or GOOGLE_API_KEY) is required for embedding generation.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/${EMBEDDING_API_VERSION}/models/${EMBEDDING_MODEL}:embedContent`;

  async function embedQuery(text) {
    const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: EXPECTED_DIMENSIONS
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`embedContent ${response.status}: ${errorBody}`);
    }

    const payload = await response.json();
    const values = payload && payload.embedding && payload.embedding.values;
    if (!Array.isArray(values)) {
      throw new Error(`embedContent returned no embedding values: ${JSON.stringify(payload)}`);
    }
    return values;
  }

  console.log(`[Embeddings] Using model: ${EMBEDDING_MODEL} via ${EMBEDDING_API_VERSION} (${EXPECTED_DIMENSIONS} dimensions).`);
  return { embedQuery };
}

// --- Deterministic document id ----------------------------------------------
function buildDeterministicDocId(chunk) {
  return crypto
    .createHash('sha256')
    .update(`${chunk.metadata.category}::${chunk.metadata.source}::${chunk.content}`)
    .digest('hex');
}

// --- PHASE 3C: Embed and upsert natively ------------------------------------
async function upsertChunksToFirestore(db, embeddings, chunks) {
  logBanner('PHASE 3C: Generate Embeddings and Upsert Firestore Documents');

  const collectionRef = db.collection(FIRESTORE_COLLECTION);
  let successfulWrites = 0;
  let failedWrites = 0;

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const ordinal = i + 1;
    const chunkPreview = chunk.content.slice(0, 80).replace(/\s+/g, ' ');

    console.log(`[Ingestion] Processing chunk ${ordinal}/${chunks.length} | source=${chunk.metadata.source}`);
    console.log(`[Ingestion] Preview: ${chunkPreview}${chunk.content.length > 80 ? '...' : ''}`);

    try {
      const vector = await embeddings.embedQuery(chunk.content);
      console.log(`[Ingestion] Embedding generated for chunk ${ordinal}; dimensions=${vector.length}`);

      if (vector.length !== EXPECTED_DIMENSIONS) {
        console.warn(`[Ingestion] WARNING: expected ${EXPECTED_DIMENSIONS} dimensions but received ${vector.length}.`);
      }

      const docId = buildDeterministicDocId(chunk);
      await collectionRef.doc(docId).set(
        {
          content: chunk.content,
          source: chunk.metadata.source,
          category: chunk.metadata.category,
          embedding: FieldValue.vector(vector),
          createdAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      successfulWrites += 1;
      console.log(`[Ingestion] Firestore upsert succeeded for docId=${docId}`);
    } catch (error) {
      failedWrites += 1;
      console.error(`[Ingestion] Failure for chunk ${ordinal} (source=${chunk.metadata.source}):`, error.message);
    }
  }

  console.log(`[Ingestion] Completed Firestore upserts. successful=${successfulWrites}, failed=${failedWrites}`);
  return { successfulWrites, failedWrites };
}

// --- Orchestrator -----------------------------------------------------------
async function runKnowledgeIngestion() {
  logBanner('MARKETMIND MARKET INTELLIGENCE INGESTION START');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP
  });

  console.log(`[Chunking] RecursiveCharacterTextSplitter initialized with chunkSize=${CHUNK_SIZE} and chunkOverlap=${CHUNK_OVERLAP}.`);

  const allChunks = await loadAndChunkArticles(splitter);

  console.log(`[Ingestion] Combined chunk total: ${allChunks.length}`);
  if (allChunks.length === 0) {
    console.warn('[Ingestion] No chunks were generated. Exiting without Firestore writes.');
    console.log(`[Ingestion] Place .md or .txt articles in ${DOCS_ROOT} and re-run.`);
    return;
  }

  const db = initializeFirestore();
  const embeddings = initializeEmbeddingsModel();

  await upsertChunksToFirestore(db, embeddings, allChunks);

  console.log(
    `CRITICAL SUCCESS: Ingestion complete. Ensure a Single-Field Vector Index has been provisioned in the Google Cloud Console for the 'embedding' field on the '${FIRESTORE_COLLECTION}' collection (${EXPECTED_DIMENSIONS} dimensions) to enable KNN vector lookups.`
  );
}

if (require.main === module) {
  runKnowledgeIngestion().catch((error) => {
    console.error('[Fatal] Knowledge ingestion aborted:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  runKnowledgeIngestion,
  discoverArticleFiles,
  loadAndChunkArticles,
  upsertChunksToFirestore
};
