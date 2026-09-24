export default function ContentScoreCard({ pageScore }) {
  if (!pageScore) return null;

  const { url, scores = {}, overallPageScore = 0, feedback, suggestedImprovements = [] } = pageScore;

  const renderProgressBar = (label, value) => {
    const percent = value || 0;
    return (
      <div key={label} className="progress-container" style={{ marginBottom: '1rem' }}>
        <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          <span>{label}</span>
          <span>{percent}/100</span>
        </div>
        <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div className="progress-fill" style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 1s ease-out' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-compact">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 className="card-title">Content Extractability</h4>
          <p className="card-subtitle" style={{ fontSize: '0.875rem', opacity: 0.8 }}>{url}</p>
        </div>
        <div className="score-badge" style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          {overallPageScore}/100
        </div>
      </div>
      <div className="card-content">
        <div className="scores-grid">
          {renderProgressBar('Answerability', scores.firstSentenceAnswerability)}
          {renderProgressBar('Definition Clarity', scores.definitionClarity)}
          {renderProgressBar('Fact Specificity', scores.factSpecificity)}
          {renderProgressBar('Scannable Structure', scores.scannableStructure)}
          {renderProgressBar('FAQ Presence', scores.faqPresence)}
          {renderProgressBar('Citation Readiness', scores.citationReadiness)}
        </div>

        {feedback && (
          <div className="feedback-section" style={{ marginTop: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Feedback:</strong>
            <p>{feedback}</p>
          </div>
        )}

        {suggestedImprovements && suggestedImprovements.length > 0 && (
          <div className="improvements-section" style={{ marginTop: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Suggested Improvements:</strong>
            <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
              {suggestedImprovements.map((imp, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>{imp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
