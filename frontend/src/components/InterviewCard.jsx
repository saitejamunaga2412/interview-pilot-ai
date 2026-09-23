function InterviewCard({ question }) {
  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "15px",
        margin: "10px",
      }}
    >
      <h3>{question}</h3>
    </div>
  );
}

export default InterviewCard;