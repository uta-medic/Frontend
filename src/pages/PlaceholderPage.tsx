interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
}

export function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <section>
      <div className="page-heading">
        <span className="page-kicker">UtaMedic</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <article className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3>Sección preparada</h3>
        <p>
          En el siguiente paso conectaremos esta pantalla con los
          endpoints correspondientes del backend.
        </p>
      </article>
    </section>
  );
}