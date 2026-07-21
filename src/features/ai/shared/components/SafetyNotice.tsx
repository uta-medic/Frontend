interface SafetyNoticeProps {
  children: string;
  emphasis?: boolean;
}

export function SafetyNotice({ children, emphasis = false }: SafetyNoticeProps) {
  return (
    <aside className={`safety-notice${emphasis ? ' safety-notice--strong' : ''}`}>
      <span className="safety-notice__icon" aria-hidden="true">
        i
      </span>
      <p>{children}</p>
    </aside>
  );
}
