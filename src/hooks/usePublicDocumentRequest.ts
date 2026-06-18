import { useState } from 'react';
import { submitDocumentRequest, trackRequest } from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type {
  SubmitDocumentRequestPayload,
  TrackedDocumentRequest,
} from '../types/database';

export function usePublicDocumentRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: SubmitDocumentRequestPayload) {
    setSubmitting(true);
    setError(null);

    const result = await submitDocumentRequest(payload);
    setSubmitting(false);

    if (result.error || !result.trackingCode) {
      const message = getServiceErrorMessage(
        result.error,
        'Unable to submit your document request. Please review the form and try again.'
      );
      setError(message);
      return { trackingCode: null, error: message };
    }

    return { trackingCode: result.trackingCode, error: null };
  }

  async function track(trackingCode: string) {
    setTracking(true);
    setError(null);

    const result = await trackRequest(trackingCode);
    setTracking(false);

    if (result.error) {
      const message = getServiceErrorMessage(
        result.error,
        'Unable to track this request right now. Please try again.'
      );
      setError(message);
      return { request: null, error: message };
    }

    if (!result.data) {
      const message = 'No document request was found for this tracking code.';
      setError(message);
      return { request: null, error: message };
    }

    return {
      request: result.data as TrackedDocumentRequest,
      error: null,
    };
  }

  function clearError() {
    setError(null);
  }

  return {
    submitting,
    tracking,
    error,
    submit,
    track,
    clearError,
  };
}
