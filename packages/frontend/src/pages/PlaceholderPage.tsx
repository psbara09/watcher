interface PlaceholderPageProps {
  title: string;
  message: string;
}

function PlaceholderPage({ title, message }: PlaceholderPageProps) {
  return (
    <div className="placeholder-page" data-testid="placeholder-page">
      <div className="placeholder-content">
        <span className="placeholder-icon">🚧</span>
        <h2 data-testid="placeholder-title">{title}</h2>
        <p data-testid="placeholder-message">{message}</p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
