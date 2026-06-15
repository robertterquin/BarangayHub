import type { AuthError, PostgrestError } from '@supabase/supabase-js';

type ServiceErrorLike = Pick<PostgrestError, 'message' | 'details' | 'hint' | 'code'> | AuthError;

export function getServiceErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && 'message' in error) {
    const serviceError = error as ServiceErrorLike;
    return serviceError.message || fallback;
  }

  return fallback;
}
