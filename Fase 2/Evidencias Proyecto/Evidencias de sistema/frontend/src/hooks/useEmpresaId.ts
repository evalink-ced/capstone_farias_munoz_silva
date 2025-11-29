// hooks/useEmpresaId.ts
import { useUser } from "./useUser";

export function useEmpresaId(): number | null {
  const { user } = useUser();

  if (
    typeof user?.empresa === "object" &&
    user.empresa !== null &&
    "id" in user.empresa
  ) {
    return user.empresa.id;
  }

  if (typeof user?.empresa === "number") {
    return user.empresa;
  }

  return null;
}
