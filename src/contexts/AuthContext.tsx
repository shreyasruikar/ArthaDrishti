import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; message?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export this hook with the name your components expect
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// Keep this export for backward compatibility
export const useAuth = useAuthContext;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Use production URL when deployed, localhost when developing
    const baseUrl = import.meta.env.PROD 
      ? 'https://artha-drishti.vercel.app'
      : window.location.origin;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: baseUrl
      }
    });

    if (error) {
      return { error };
    }

    return { 
      error: null, 
      message: "✅ Check your email for the verification link!" 
    };
  };

  const resetPassword = async (email: string) => {
    // Use production URL when deployed, localhost when developing
    const baseUrl = import.meta.env.PROD 
      ? 'https://artha-drishti.vercel.app'
      : window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      return { error };
    }

    return {
      error: null,
      message: "✅ Password reset link sent to your email!"
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
