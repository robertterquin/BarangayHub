import { useCallback, useState } from 'react';
import { submitFeedback } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { SubmitFeedbackPayload } from '../types/database';

export function usePublicFeedback() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: SubmitFeedbackPayload) => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitFeedback(payload);

      if (result.error) {
        setError(getServiceErrorMessage(result.error, 'Unable to submit feedback.'));
        return { id: null };
      }

      return { id: result.data as string | null };
    } catch (requestError) {
      setError(getServiceErrorMessage(requestError, 'Unable to submit feedback.'));
      return { id: null };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submit,
    submitting,
    error,
    clearError: () => setError(null),
  };
}
