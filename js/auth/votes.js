// Verificar si ya votó/reportó
async function hasUserAction(reviewId, actionType) {
  const user = firebase.auth().currentUser;
  if (!user) return false;

  const snapshot = await db.collection("userActions")
    .where("userId", "==", user.uid)
    .where("reviewId", "==", reviewId)
    .where("actionType", "==", actionType) // 'vote' o 'report'
    .limit(1)
    .get();

  return !snapshot.empty;
}

// Registrar acción (voto/reporte)
async function recordUserAction(reviewId, actionType) {
  const user = firebase.auth().currentUser;
  await db.collection("userActions").add({
    userId: user.uid,
    reviewId: reviewId,
    actionType: actionType,
    timestamp: new Date()
  });
}