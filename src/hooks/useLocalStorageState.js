import { useState } from "react";

/**
 * useState respaldado en localStorage. Lee el valor guardado al montar
 * y persiste automáticamente cada cambio. Si localStorage no está
 * disponible o el valor guardado está corrupto, cae al valor inicial.
 */
export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setAndPersist(valueOrUpdater) {
    setState((prev) => {
      const next = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // almacenamiento lleno o bloqueado: seguimos en memoria igual
      }
      return next;
    });
  }

  return [state, setAndPersist];
}
