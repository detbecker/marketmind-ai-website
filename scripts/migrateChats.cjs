#!/usr/bin/env node

/**
 * One-off chat_leads migration between Firebase projects using native Firestore.
 * Source  -> marketmind-ai-497018
 * Target  -> marketmind-ai-website
 */

const { Firestore } = require('@google-cloud/firestore');

const SOURCE_PROJECT_ID = 'marketmind-ai-497018';
const TARGET_PROJECT_ID = 'marketmind-ai-website';
const COLLECTION = 'chat_leads';
const BATCH_LIMIT = 500;

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

async function migrateChatLeads() {
  const sourceDb = new Firestore({ projectId: SOURCE_PROJECT_ID });
  const targetDb = new Firestore({ projectId: TARGET_PROJECT_ID });

  console.log(`[Migration] Reading '${COLLECTION}' from ${SOURCE_PROJECT_ID}...`);
  const sourceSnap = await sourceDb.collection(COLLECTION).get();

  const totalSourceDocs = sourceSnap.size;
  console.log(`[Migration] Found ${totalSourceDocs} source document(s).`);

  if (totalSourceDocs === 0) {
    console.log('[Migration] Nothing to copy. Exiting.');
    return { sourceCount: 0, transferred: 0 };
  }

  const docs = sourceSnap.docs;
  const docChunks = chunk(docs, BATCH_LIMIT);

  let transferred = 0;

  for (let i = 0; i < docChunks.length; i += 1) {
    const group = docChunks[i];
    const batch = targetDb.batch();

    for (const doc of group) {
      const targetRef = targetDb.collection(COLLECTION).doc(doc.id);
      batch.set(targetRef, doc.data());
    }

    await batch.commit();
    transferred += group.length;
    console.log(`[Migration] Committed batch ${i + 1}/${docChunks.length} (${transferred}/${totalSourceDocs}).`);
  }

  console.log(`[Migration] DONE: transferred=${transferred}`);
  return { sourceCount: totalSourceDocs, transferred };
}

if (require.main === module) {
  migrateChatLeads()
    .then(({ sourceCount, transferred }) => {
      console.log(`TOTAL_SOURCE_DOCS=${sourceCount}`);
      console.log(`TOTAL_TRANSFERRED=${transferred}`);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exitCode = 1;
    });
}

module.exports = { migrateChatLeads };
