import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVal = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!;
  }
  return fallback;
};

// Environment variable retrieval
const supabaseUrl = getEnvVal('VITE_SUPABASE_URL', 'https://ngvoqfrbxrhbniarfkor.supabase.co');
const supabaseAnonKey = getEnvVal('VITE_SUPABASE_ANON_KEY', 'sb_publishable_2kBEJ6SfckNq9q43jkLYyQ_5lqoLz4b');

export let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
} catch (err) {
  console.warn('[Supabase] Initialized in fallback mode:', err);
}

// --------------------------------------------------------------------
// SUPABASE AUTHENTICATION SERVICE
// --------------------------------------------------------------------
export const supabaseAuthService = {
  /**
   * Register new user with email & password
   */
  async signUp(email: string, pass: string, name: string) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: name
          }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase Auth] SignUp error:', err);
      return null;
    }
  },

  /**
   * Login user with email & password
   */
  async signIn(email: string, pass: string) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Supabase Auth] SignIn error:', err);
      return null;
    }
  },

  /**
   * Sign out current user session
   */
  async signOut() {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] SignOut error:', err);
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (err) {
      return null;
    }
  }
};

// --------------------------------------------------------------------
// SUPABASE STORAGE SERVICE
// --------------------------------------------------------------------
export const supabaseStorageService = {
  BUCKET_NAME: 'zain-assets',

  /**
   * Upload file to Supabase Storage bucket
   */
  async uploadFile(path: string, file: Blob | File): Promise<string | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, file, { upsert: true });

      if (error) throw error;
      return this.getPublicUrl(data.path);
    } catch (err) {
      console.warn('[Supabase Storage] Upload error:', err);
      return null;
    }
  },

  /**
   * Get public download URL for a file
   */
  getPublicUrl(path: string): string {
    if (!supabase) return `https://zainauto.io/storage/${path}`;
    const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);
      return !error;
    } catch (err) {
      console.warn('[Supabase Storage] Delete error:', err);
      return false;
    }
  }
};

// --------------------------------------------------------------------
// SUPABASE DATABASE HELPER
// --------------------------------------------------------------------
export const supabaseDb = {
  async select<T>(table: string, filters?: Record<string, any>, orderByCol?: string, ascending: boolean = false): Promise<T[] | null> {
    if (!supabase) return null;
    try {
      let queryBuilder = supabase.from(table).select('*');
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          queryBuilder = queryBuilder.eq(k, v);
        });
      }
      if (orderByCol) {
        queryBuilder = queryBuilder.order(orderByCol, { ascending });
      }
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data as T[];
    } catch (err) {
      console.warn(`[Supabase DB] Select ${table} error:`, err);
      return null;
    }
  },

  async insert<T>(table: string, payload: any): Promise<T | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from(table).upsert(payload).select().single();
      if (error) throw error;
      return data as T;
    } catch (err) {
      console.warn(`[Supabase DB] Insert ${table} error:`, err);
      return null;
    }
  },

  async update<T>(table: string, matchKey: string, matchVal: any, payload: any): Promise<T | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from(table).update(payload).eq(matchKey, matchVal).select().single();
      if (error) throw error;
      return data as T;
    } catch (err) {
      console.warn(`[Supabase DB] Update ${table} error:`, err);
      return null;
    }
  },

  async delete(table: string, matchKey: string, matchVal: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from(table).delete().eq(matchKey, matchVal);
      return !error;
    } catch (err) {
      console.warn(`[Supabase DB] Delete ${table} error:`, err);
      return false;
    }
  }
};
