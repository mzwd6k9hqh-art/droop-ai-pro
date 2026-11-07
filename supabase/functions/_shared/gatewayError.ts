export function gatewayError(status: number, payload: unknown) {
  const body = payload && typeof payload === 'object' ? payload as Record<string, any> : {};
  const message = typeof body.message === 'string' ? body.message
    : typeof body.error?.message === 'string' ? body.error.message
    : typeof body.error === 'string' ? body.error
    : `AI service returned ${status}`;
  return { status, message, ...(body.props ? { props: body.props } : {}) };
}