import { supabase } from '../services/supabase';

/**
 * Generates a unique BD2-YYYY-XXXX reference ID.
 * XXXX is a random non-sequential 4-digit zero-padded number.
 * Verifies uniqueness against the database before returning.
 */
export async function generateReferenceId(
  table: 'residents' | 'document_requests' | 'complaints',
  column: string
): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt++) {
    const random = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    const referenceId = `BD2-${year}-${random}`;

    const { data } = await supabase
      .from(table)
      .select('id')
      .eq(column, referenceId)
      .maybeSingle();

    if (!data) return referenceId; // unique — safe to use
  }

  throw new Error('Failed to generate a unique reference ID after 10 attempts.');
}
