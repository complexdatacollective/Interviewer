import { Context } from "https://deno.land/x/oak/mod.ts";

interface UploadOptions {
  extensions?: Array<string>;
  maxSizeBytes: number;
  maxFileSizeBytes: number;
}

const defaultUploadOptions: UploadOptions = {
  extensions: [],
  maxSizeBytes: Number.MAX_SAFE_INTEGER,
  maxFileSizeBytes: Number.MAX_SAFE_INTEGER,
}

export const multipartUpload = (options: UploadOptions = defaultUploadOptions) => async (context: Context, next: () => Promise<void>) => {
  const mergedOptions = Object.assign({}, defaultUploadOptions, options);
  const { extensions, maxSizeBytes, maxFileSizeBytes } = mergedOptions;

  // Reject requests that are too large
  const contentLengthHeader = context.request.headers.get("content-length");
  if (contentLengthHeader && parseInt(contentLengthHeader) > maxSizeBytes!) {
    context.throw(
      422,
      `Maximum total upload size exceeded (size: ${contentLengthHeader} bytes, maximum: ${maxSizeBytes} bytes).`,
    );
  }

  if (!context.request.hasBody) {
    context.throw(415, "Request must have a body");
  }

  const body = context.request.body();

  if (body.type === "form-data") {
    const formData = await body.value.read({
      maxFileSize: maxFileSizeBytes,
      maxSize: 0, // All files will be written to disk: https://github.com/oakserver/oak/issues/208
    });

    context.state.formData = formData;
  }

  await next();

  delete context.state.formData;
}