interface ErrorListProps {
  errores: string[];
}

export default function ErrorList({ errores }: ErrorListProps) {
  if (errores.length === 0) return null;

  return (
    <ul className="text-danger text-sm list-disc pl-5 mb-4">
      {errores.map((err, idx) => (
        <li key={idx}>{err}</li>
      ))}
    </ul>
  );
}
