import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Map Firebase User to App User structure if needed, or just use partial
  // The app expects { id, email, firstName, lastName, profileImageUrl }
  const user: User | null = currentUser ? {
    id: currentUser.uid,
    email: currentUser.email,
    firstName: currentUser.displayName?.split(" ")[0] || "User",
    lastName: currentUser.displayName?.split(" ").slice(1).join(" ") || "",
    profileImageUrl: currentUser.photoURL,
    // Create/Update dates are not available on the client instantly without fetching from DB, 
    // but for UI display we might not need them immediately.
  } : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!currentUser,
    loginMutation,
    logoutMutation
  };
}
