import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Terms — Overtone',
  description: 'The terms on which Overtone is provided.',
};

export default function TermsPage() {
  return (
    <Site>
      <section className="section section--tight">
        <div className="wrap wrap--narrow" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <h1>Terms of service</h1>
          <p className="lede">Last updated 19 September 2026.</p>

          <h2>What Overtone provides</h2>
          <p>
            Overtone is a research tool that indexes recordings you choose to capture and
            answers questions about them with citations. It is provided as it stands, and
            it is early software: features change and occasionally break.
          </p>

          <h2>Your account</h2>
          <p>
            You are responsible for keeping your credentials safe and for activity under
            your account. One workspace is intended for one team; tell us before sharing
            access more widely than that.
          </p>

          <h2>Your content</h2>
          <p>
            Transcripts, notes, captures and memos in your workspace remain yours. We store
            and process them to operate the product, and we do not use them to train models
            or share them with other customers. Transcripts are held per customer and are
            never pooled.
          </p>

          <h2>What you are responsible for</h2>
          <p>
            You are responsible for having the right to capture the recordings you index,
            and for complying with the terms of the venues you capture from. Overtone hosts
            your working copy of a call you initiated the capture of; it is not a
            redistributable transcript library and must not be used as one.
          </p>

          <h2>Not investment advice</h2>
          <p>
            Overtone produces research artifacts from a recording. It does not give
            investment advice, and its output is not a recommendation. Answers are generated
            by language models and can be wrong, which is precisely why every claim carries
            a citation back to the source — check them before you act on them.
          </p>

          <h2>Availability</h2>
          <p>
            There is no uptime commitment at this stage. The service may be unavailable for
            maintenance or because an upstream provider is down.
          </p>

          <h2>Ending it</h2>
          <p>
            You can stop using Overtone at any time and ask us to delete your account and
            everything in it. We may suspend an account that is being used to breach these
            terms or a venue&apos;s.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a href="mailto:etisamhaq24@gmail.com">
              etisamhaq24@gmail.com
            </a>
          </p>
        </div>
      </section>
    </Site>
  );
}
