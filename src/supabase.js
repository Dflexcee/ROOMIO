// Legacy Supabase file - replaced by PHP API
// This file is kept for compatibility with files that haven't been migrated yet

export const supabase = {
  // Dummy methods to prevent errors in unmigrated files
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }) }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }),
      remove: () => Promise.resolve({ data: null, error: new Error('Supabase deprecated') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}; 