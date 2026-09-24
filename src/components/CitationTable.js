export default function CitationTable({ citations = [] }) {
  if (!citations || citations.length === 0) {
    return <p>No citation data available.</p>;
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'cited': return 'citation-cited';
      case 'partial': return 'citation-partial';
      case 'not cited': return 'citation-not-cited';
      default: return 'citation-not-probed';
    }
  };

  return (
    <div className="table-container">
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '0.5rem' }}>Keyword</th>
            <th style={{ padding: '0.5rem' }}>Engine</th>
            <th style={{ padding: '0.5rem' }}>Status</th>
            <th style={{ padding: '0.5rem' }}>Context</th>
            <th style={{ padding: '0.5rem' }}>Competitors</th>
          </tr>
        </thead>
        <tbody>
          {citations.map((citation, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.5rem' }}>{citation.keyword}</td>
              <td style={{ padding: '0.5rem' }}>{citation.engine}</td>
              <td style={{ padding: '0.5rem' }}>
                <span className={`citation-status ${getStatusClass(citation.status)}`}>
                  {citation.status}
                </span>
              </td>
              <td style={{ padding: '0.5rem' }}>{citation.citationContext || 'N/A'}</td>
              <td style={{ padding: '0.5rem' }}>
                {citation.competitorsCited && citation.competitorsCited.length > 0 
                  ? citation.competitorsCited.join(', ') 
                  : 'None'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
