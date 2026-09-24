export default function IssueList({ issues = [] }) {
  if (!issues || issues.length === 0) return <p>No issues found.</p>;

  const severityOrder = { critical: 1, warning: 2, info: 3 };
  const sortedIssues = [...issues].sort((a, b) => {
    return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
  });

  return (
    <div className="issue-list">
      {sortedIssues.map((issue, idx) => (
        <div key={idx} className={`issue-item issue-item-${issue.severity}`}>
          <div className="issue-header" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="issue-severity" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {issue.severity}
            </span>
            <span className="issue-category">
              {issue.category}
            </span>
          </div>
          <h4 className="issue-title">{issue.issue}</h4>
          <p className="issue-details">{issue.details}</p>
          {issue.pageUrl && <p className="issue-url"><strong>URL:</strong> {issue.pageUrl}</p>}
          {issue.fixSuggestion && (
            <div className="issue-fix" style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              <strong>Fix Suggestion:</strong>
              <p>{issue.fixSuggestion}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
