export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function error(message: string, status = 500, details?: unknown) {
  return Response.json({ success: false, error: message, details }, { status });
}

export function validationError(errors: unknown) {
  return Response.json(
    { success: false, error: 'Validation failed', details: errors },
    { status: 400 },
  );
}
