/**
 * Offline MVP: authentication is disabled. These exports are kept only to
 * prevent legacy imports from crashing during the transition. Phase 4 will
 * reintroduce a proper auth module for optional cloud sync.
 */

export const loginWithGoogle = async () => {
  return {
    success: false,
    error: "Login is not required in the offline app.",
  };
};

export const getToken = async (): Promise<string | null> => {
  return null;
};

export const logout = async () => {
  // no-op
};
