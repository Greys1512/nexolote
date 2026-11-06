interface LoaderProps {
  label: string;
}

export default function Loader({ label }: LoaderProps) {
  return (
    <p className="loading-indicator" role="status">
      <span className="loading-spinner" aria-hidden="true" />
      {label}
    </p>
  );
}
