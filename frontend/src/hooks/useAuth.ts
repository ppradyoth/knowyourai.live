import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import("../firebase"),
        import("firebase/auth"),
      ]);
      if (!active) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  return { user, loading, getToken };
}
