import { Effect, Fiber, Layer, Queue, Stream } from 'effect';

import { DatabaseError } from '@codaco/network-exporters/errors';
import { makeZipOutput } from '@codaco/network-exporters/layers/ZipOutput';
import { exportPipeline } from '@codaco/network-exporters/pipeline';
import { InterviewRepository } from '@codaco/network-exporters/services/InterviewRepository';
import { ProtocolRepository } from '@codaco/network-exporters/services/ProtocolRepository';

/**
 * Build the InterviewRepository layer from in-memory data. `interviews` is the
 * mapped InterviewExportInput[] for the sessions the caller selected; this just
 * returns the subset matching the requested ids.
 */
const makeInterviewRepoLayer = (interviews) =>
  Layer.succeed(InterviewRepository, {
    getForExport: (ids) =>
      Effect.try({
        try: () => {
          const byId = new Map(
            interviews.map((interview) => [interview.id, interview]),
          );
          return ids
            .map((id) => byId.get(id))
            .filter((interview) => interview !== undefined);
        },
        catch: (cause) => new DatabaseError({ cause }),
      }),
  });

/**
 * Build the ProtocolRepository layer from in-memory data. `protocols` is a
 * Record<hash, ProtocolExportInput>; this returns the subset for the requested
 * hashes.
 */
const makeProtocolRepoLayer = (protocols) =>
  Layer.succeed(ProtocolRepository, {
    getProtocols: (hashes) =>
      Effect.try({
        try: () => {
          const out = {};
          for (const hash of hashes) {
            if (protocols[hash]) {
              out[hash] = protocols[hash];
            }
          }
          return out;
        },
        catch: (cause) => new DatabaseError({ cause }),
      }),
  });

/**
 * Collects the zip stream into an in-memory Blob. Blob is available in both the
 * Electron renderer and mobile webviews, so the produced bytes can be saved via
 * the app's cross-platform writeFile helper.
 */
function makeBlobSink() {
  let result = null;
  const sink = (iterable, fileName) =>
    Effect.tryPromise({
      try: async () => {
        const chunks = [];
        for await (const chunk of iterable) {
          chunks.push(new Uint8Array(chunk));
        }
        const blob = new Blob(chunks, { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        result = { blob, url, fileName };
        return { key: fileName, url };
      },
      catch: (cause) => {
        throw cause;
      },
    });
  return {
    sink,
    getResult: () => result,
  };
}

/**
 * Run the export pipeline in the renderer.
 *
 * @param {Object} args
 * @param {Object} args.options ExportOptions for the pipeline.
 * @param {string[]} args.sessionIds Ids of the interviews to export.
 * @param {Array} args.interviews Mapped InterviewExportInput[] for the sessions.
 * @param {Record<string, Object>} args.protocols Record<hash, ProtocolExportInput>.
 * @param {(event: Object) => void} [args.onEvent] Receives ExportEvent updates.
 * @returns {{ promise: Promise<{ result, blob, url, fileName }>, abort: () => void }}
 */
export function runExport({
  options,
  sessionIds,
  interviews,
  protocols,
  onEvent,
}) {
  const { sink, getResult } = makeBlobSink();
  const outputLayer = makeZipOutput(sink);
  const interviewRepoLayer = makeInterviewRepoLayer(interviews);
  const protocolRepoLayer = makeProtocolRepoLayer(protocols);

  const program = Effect.gen(function* () {
    const queue = yield* Queue.unbounded();

    const drain = Effect.forkScoped(
      Stream.fromQueue(queue).pipe(
        Stream.runForEach((event) =>
          Effect.sync(() => {
            onEvent?.(event);
          }),
        ),
      ),
    );

    yield* drain;

    const result = yield* exportPipeline(sessionIds, options, queue);
    yield* Queue.shutdown(queue);
    return result;
  });

  const runnable = Effect.scoped(program).pipe(
    Effect.provide(
      Layer.mergeAll(interviewRepoLayer, protocolRepoLayer, outputLayer),
    ),
  );

  // Run as a fiber so the export can be interrupted via abort().
  const fiber = Effect.runFork(runnable);

  const promise = Effect.runPromise(Fiber.join(fiber)).then((result) => {
    const sinkResult = getResult();
    return {
      result,
      blob: sinkResult?.blob ?? null,
      url: sinkResult?.url ?? null,
      fileName: sinkResult?.fileName ?? null,
    };
  });

  const abort = () => {
    Effect.runFork(Fiber.interrupt(fiber));
  };

  return { promise, abort };
}
