function ScoreCard({ score }) {
  return (
    <div
      style={{
        border: "1px solid green",
        padding: "20px",
      }}
    >
      <h2>Score</h2>

      <h1>{score}</h1>
    </div>
  );
}

export default ScoreCard;