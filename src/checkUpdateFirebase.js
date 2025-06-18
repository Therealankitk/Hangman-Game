import { db, ref, get, set} from "./firebase"

export async function qualifiesForTop3(currentScore) {
    const highScoresRef = ref(db, "highscores");
    const snapshot = await get(highScoresRef);
    let scores = [];

    if (snapshot.exists()) {
        scores = snapshot.val();
    }

    if (scores.length < 3) return true;
    const minTopScore = Math.min(...scores.map(s => s.score));
    return currentScore > minTopScore;
}

export async function updateHighScores(newScore, playerName) {
  const highScoresRef = ref(db, "highscores");
  const snapshot = await get(highScoresRef);
  let scores = [];

  if (snapshot.exists()) {
    scores = snapshot.val();
  }

  scores.push({ name: playerName, score: newScore });
  scores.sort((a, b) => b.score - a.score);
  const topThree = scores.slice(0, 3);

  await set(highScoresRef, topThree);
}

