"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getStoredUser, getAccessToken, saveSession } from "@/lib/session";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profileUser, setProfileUser] = useState(() => getStoredUser());

  const updateProfileUser = useCallback((user) => {
    setProfileUser(user);

    const token = getAccessToken();
    if (token && user) {
      saveSession(token, user);
    }
  }, []);

  const value = useMemo(
    () => ({ profileUser, updateProfileUser }),
    [profileUser, updateProfileUser],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}
