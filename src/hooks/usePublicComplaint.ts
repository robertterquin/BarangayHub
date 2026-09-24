import { useState } from 'react';
import {
  submitComplaint,
  trackComplaint,
  uploadComplaintAttachment,
} from '../services/publicService';
import { getServiceErrorMessage } from '../services/serviceError';
import type { SubmitComplaintPayload, TrackedComplaint } from '../types/database';

export function usePublicComplaint() {
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: SubmitComplaintPayload, attachment?: File | null) {
    setSubmitting(true);
    setError(null);

    let attachmentUrl = payload.attachmentUrl ?? null;

    if (attachment) {
      const uploadResult = await uploadComplaintAttachment(attachment);
      if (uploadResult.error || !uploadResult.data?.path) {
        const message = getServiceErrorMessage(
          uploadResult.error,
          'Unable to upload the attachment. Please try again or submit without an attachment.'
        );
        setError(message);
        setSubmitting(false);
        return { referenceId: null, error: message };
      }

      attachmentUrl = uploadResult.data.path;
    }

    const result = await submitComplaint({
      ...payload,
      attachmentUrl,
    });
    setSubmitting(false);

    if (result.error || !result.referenceId) {
      const message = getServiceErrorMessage(
        result.error,
        'Unable to submit your complaint. Please review the form and try again.'
      );
      setError(message);
      return { referenceId: null, error: message };
    }

    return { referenceId: result.referenceId, error: null };
  }

  async function track(referenceId: string) {
    setTracking(true);
    setError(null);

    const result = await trackComplaint(referenceId);
    setTracking(false);

    if (result.error) {
      const message = getServiceErrorMessage(
        result.error,
        'Unable to track this complaint right now. Please try again.'
      );
      setError(message);
      return { complaint: null, error: message };
    }

    if (!result.data) {
      const message = 'No complaint was found for this reference number.';
      setError(message);
      return { complaint: null, error: message };
    }

    return {
      complaint: result.data as TrackedComplaint,
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
