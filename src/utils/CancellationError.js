/**
 * Custom error class for user-initiated cancellations.
 * Replaces builder-util-runtime's CancellationError to avoid
 * bundling Node.js modules in the renderer.
 */
export class CancellationError extends Error {
  constructor(message = 'Operation cancelled') {
    super(message);
    this.name = 'CancellationError';
  }
}
