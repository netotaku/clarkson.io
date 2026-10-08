export const LOCAL_TEST_BATCH = 'hitcounter-local-v1';

export function captureMode(environment = process.env) {
  if (environment.NETLIFY_DEV === 'true') {
    const enabled = environment.HIT_COUNTER_LOCAL_TEST === 'true';
    return { enabled, testBatch: enabled ? LOCAL_TEST_BATCH : undefined };
  }
  return { enabled: environment.HIT_COUNTER_CAPTURE_ENABLED === 'true', testBatch: undefined };
}
