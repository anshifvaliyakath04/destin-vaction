import { supabaseServer } from './supabase-server';

export const db = {
  from: (table: string) => ({
    select: (cols = '*') => ({
      eq: (col: string, val: any) => ({
        single: async () => {
          const { data } = await supabaseServer.from(table).select(cols).eq(col, val).maybeSingle();
          return { data, error: null };
        },
        maybeSingle: async () => {
          const { data } = await supabaseServer.from(table).select(cols).eq(col, val).maybeSingle();
          return { data, error: null };
        },
        order: (col: string, opts: any) => ({
          then: async (fn: any) => {
            const { data } = await supabaseServer.from(table).select(cols).eq(col, val).order(col, opts);
            return { data, error: null };
          },
        }),
      }),
      order: (col: string, opts: any) => ({
        then: async (fn: any) => {
          const { data } = await supabaseServer.from(table).select(cols).order(col, opts);
          return { data, error: null };
        },
      }),
      then: async (fn: any) => {
        const { data } = await supabaseServer.from(table).select(cols);
        return { data, error: null };
      },
    }),
    insert: (rows: any) => ({
      select: (cols = '*') => ({
        single: async () => {
          const { data } = await supabaseServer.from(table).insert(rows).select(cols).single();
          return { data, error: null };
        },
        then: async (fn: any) => {
          const { data } = await supabaseServer.from(table).insert(rows).select(cols);
          return { data, error: null };
        },
      }),
      then: async (fn: any) => {
        const { data } = await supabaseServer.from(table).insert(rows);
        return { data, error: null };
      },
    }),
    update: (updates: any) => ({
      eq: (col: string, val: any) => ({
        select: (cols = '*') => ({
          single: async () => {
            const { data } = await supabaseServer.from(table).update(updates).eq(col, val).select(cols).single();
            return { data, error: null };
          },
        }),
        then: async (fn: any) => {
          const { data } = await supabaseServer.from(table).update(updates).eq(col, val);
          return { data, error: null };
        },
      }),
      then: async (fn: any) => {
        const { data } = await supabaseServer.from(table).update(updates);
        return { data, error: null };
      },
    }),
    delete: () => ({
      eq: (col: string, val: any) => ({
        then: async (fn: any) => {
          const { data } = await supabaseServer.from(table).delete().eq(col, val);
          return { data, error: null };
        },
      }),
    }),
  }),
};
