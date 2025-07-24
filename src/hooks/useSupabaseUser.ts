import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabaseUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const getUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data?.user || null);
        setLoading(false);
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 