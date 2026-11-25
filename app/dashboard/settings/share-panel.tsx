"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {state === "copied" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Copied" : label}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Copied to clipboard" : state === "failed" ? "Couldn’t copy" : ""}
      </span>
      {state === "failed" && (
        <span role="alert" className="text-sm font-medium text-danger">
          Couldn’t copy automatically. Select the text and copy it by hand.
        </span>
      )}
    </>
  );
}

export function SharePanel({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // TODO: in production, use your real domain (for example from NEXT_PUBLIC_SITE_URL)
  // so these links never depend on the address the admin happens to be using.
  const linkPath = `/verify?company=${slug}`;
  const embedPath = `/embed/verify?company=${slug}`;
  const shareLink = `${origin}${linkPath}`;
  const embedCode = `<iframe
  src="${origin}${embedPath}"
  title="Verify your product"
  width="100%"
  height="560"
  style="border:0;max-width:480px"
  loading="lazy"
></iframe>`;

  return (
    <>
      <section className="mt-10 border-t-2 border-ink pt-5">
        <h3 className="font-serif text-xl font-semibold">Share link</h3>
        <p className="mt-2 text-sm text-muted">
          No website? Share this link with customers by message, social media or on your packaging.
        </p>
        <label htmlFor="share-link" className="sr-only">Your verification link</label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="share-link"
            readOnly
            value={shareLink}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm"
          />
          <CopyButton text={shareLink} label="Copy link" />
          <a
            href={linkPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-brand"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Open
          </a>
        </div>
      </section>

      <section className="mt-12 border-t-2 border-ink pt-5">
        <h3 className="font-serif text-xl font-semibold">Add the checker to your website</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Copy the code below.</li>
          <li>On your website, add an “HTML” or “custom code” block where you want the checker.</li>
          <li>Paste the code there and save or publish the page.</li>
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CopyButton text={embedCode} label="Copy code" />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 text-sm leading-relaxed text-white">
          <code>{embedCode}</code>
        </pre>

        <h4 className="mt-8 text-sm font-semibold">Preview</h4>
        <p className="mt-1 text-sm text-muted">This is how the checker will look on your site.</p>
        <iframe
          src={embedPath}
          title="Preview of the verification widget"
          className="mt-3 h-[560px] w-full max-w-md rounded-lg border border-line bg-white"
        />
      </section>
    </>
  );
}