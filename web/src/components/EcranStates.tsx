interface MessageProps {
  message?: string;
}

export function ChargementState({ message = "Chargement en cours…" }: MessageProps) {
  return <p className="state-box" role="status">{message}</p>;
}

export function ErreurState({ message = "Une erreur est survenue." }: MessageProps) {
  return (
    <p className="state-box error" role="alert">
      {message}
    </p>
  );
}

export function VideState({ message = "Rien à afficher pour le moment." }: MessageProps) {
  return <p className="state-box">{message}</p>;
}