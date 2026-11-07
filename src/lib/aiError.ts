export async function aiErrorMessage(error: unknown): Promise<string> {
  const failure = error as { context?: Response; message?: string } | null;
  if (failure?.context instanceof Response) {
    try {
      const body = await failure.context.clone().json();
      if (typeof body.error === 'string') return body.error;
      if (typeof body.message === 'string') return body.message;
    } catch { /* Use the original failure when no JSON body is available. */ }
  }
  return failure?.message || 'The AI service could not complete this request.';
}