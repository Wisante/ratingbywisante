import { initFirebase, auth, db } from './authConfig.js';

await initFirebase();

async function voteHelpful(reviewId) {
  const user = auth.currentUser;
  if (!user) return alert('Inicia sesión para votar');

  const reviewRef = db.collection('reviews').doc(reviewId);
  
  try {
    await db.runTransaction(async (transaction) => {
      const reviewDoc = await transaction.get(reviewRef);
      const newCount = (reviewDoc.data().helpfulCount || 0) + 1;
      transaction.update(reviewRef, { helpfulCount: newCount });
    });
  } catch (error) {
    console.error("Error al votar:", error);
  }
}