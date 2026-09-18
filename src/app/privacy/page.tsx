import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — Overtone',
  description: 'What the Overtone browser extension and dashboard collect, and why.',
};

/**
 * Public, unauthenticated, and linked from the Chrome Web Store listing.
 *
 * Deliberately outside `Shell`: a store reviewer must be able to read it without
 * an account, and a redirect to the login screen would fail review.
 */
export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '68ch', margin: '0 auto', padding: '56px 24px 80px' }}>
      <Link href="/login" className="gate__logo" aria-label="Overtone" style={{ marginBottom: 32 }} />

      <h1>Privacy</h1>
      <p className="lede">
        What the Overtone extension and dashboard handle, why, and what we never touch.
        Last updated 18 September 2026.
      </p>

      <h2>What Overtone is</h2>
      <p>
        Overtone is a research tool for investment analysts. It captures an earnings call
        the analyst is already listening to, indexes the transcript, answers questions
        about it with citations, and drafts a memo. The browser extension is the capture
        surface; the dashboard is where the resulting research lives.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>Account details.</strong> Your name, email address, workspace name, and a
        hashed password. We need these to give you an account and keep one customer&apos;s
        research separate from another&apos;s. Passwords are hashed with Argon2 and are
        never stored or transmitted in a readable form.
      </p>
      <p>
        <strong>Call content you choose to capture.</strong> When you press capture, the
        extension reads the transcript the venue already publishes on that page and, if you
        use the slide capture, a still frame from the video. Both are sent to our API,
        indexed, and stored against your workspace.
      </p>
      <p>
        <strong>Your own work.</strong> Notes you type, questions you ask, and the answers
        and memos generated in response.
      </p>
      <p>
        <strong>Operational logs.</strong> Request metadata — timestamp, endpoint, a
        request id, and the IP address the request came from — kept so we can diagnose
        faults and investigate abuse.
      </p>

      <h2>What we do not collect</h2>
      <ul>
        <li>Your browsing history. The extension runs only on the specific pages listed below and cannot see any other tab.</li>
        <li>Analytics, tracking pixels, advertising identifiers, or behavioural profiling. There are none in the extension or the dashboard.</li>
        <li>Payment card details. There is no billing in the product today.</li>
        <li>Anything from a page you have not explicitly captured.</li>
      </ul>

      <h2>Where the extension runs</h2>
      <p>
        The extension requests access to exactly the venues where earnings calls are
        streamed — YouTube, and the Q4, Notified, Chorus Call and Veracast webcast hosts —
        plus our own API domain. It does not request <code>tabs</code> or access to all
        sites. On any other page it is inert.
      </p>

      <h2>How your session is stored</h2>
      <p>
        Sign-in tokens are held in <code>chrome.storage.session</code>, which the browser
        keeps in memory, never writes to disk, and discards when the browser closes. They
        are not readable by the page the panel is injected into.
      </p>

      <h2>Who else sees your data</h2>
      <p>
        Transcripts, notes and questions are sent to the model providers that produce
        answers and embeddings — currently Groq and Google (Gemini) — solely to generate
        the response you asked for. Data is stored in Supabase (Postgres and object
        storage) and served from Render and Vercel. We do not sell your data, share it with
        data brokers, use it for advertising, or use it to train models.
      </p>
      <p>
        Transcripts are held per customer and are never pooled across workspaces. Your
        workspace holds your own working copy of calls you captured.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Your research stays until you delete it. Deleting a note also deletes any captured
        slide image from object storage. To delete your account and everything in it, email
        us and we will remove it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, deletion requests, or anything else:{' '}
        <a href="mailto:etisam.ul.haq@team-linkedmatrix.com">
          etisam.ul.haq@team-linkedmatrix.com
        </a>
      </p>
    </main>
  );
}
