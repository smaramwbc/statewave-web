import { Check } from 'lucide-react'
import { LegalPage } from '../components/legal/LegalPage'
import type { LegalSection } from '../components/legal/LegalPage'

const NOT_DONE = [
  'No cookie-based analytics, ad tech, or product telemetry (no GA, PostHog, Mixpanel, Segment). Traffic counts come from Plausible, which is cookieless and stores no personal data.',
  'No advertising or marketing cookies.',
  'No third-party social-media trackers, fingerprinting, or session-replay.',
  'No cross-site tracking. The demo cookie is first-party and only readable by statewave.ai.',
]

const SECTIONS: LegalSection[] = [
  {
    id: 'cookies',
    title: 'Which cookies do we set?',
    toc: 'Cookies we set',
    body: (
      <>
        <div className="lg-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Purpose</th>
                <th scope="col">Type</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>sw_demo_visitor</td>
                <td data-label="Purpose">
                  Identifies your browser to the live demo chat so it can
                  seed and reload your demo conversation. Strictly necessary
                  for the demo to work.
                </td>
                <td data-label="Type">First-party, HttpOnly, SameSite=Lax, Secure in production</td>
                <td data-label="Lifetime">30 days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This cookie is &ldquo;strictly necessary&rdquo; under the GDPR /
          ePrivacy framework: it&rsquo;s only set when you open the demo
          chat, it carries no personal information beyond a random visitor
          ID, and it is not shared with any third party.
        </p>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'What do we keep in your browser’s storage?',
    toc: 'Browser storage',
    body: (
      <>
        <p>
          For completeness, we also use a small number of <code>localStorage</code> keys
          to remember your UI preferences. These never leave your
          browser and are not used to track you.
        </p>
        <ul className="lg-defs">
          <li>
            <strong><code>statewave:manifesto-lang</code></strong>
            The language you picked on the /why page so we don&rsquo;t
            have to re-detect it on every visit.
          </li>
          <li>
            <strong><code>statewave-demo-onboarding-v1</code></strong>
            Whether you&rsquo;ve already seen the demo widget&rsquo;s
            welcome panel, so we don&rsquo;t show it on every page load.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-trackers',
    title: 'What we don’t do',
    body: (
      <ul className="lg-list lg-list--check">
        {NOT_DONE.map(item => (
          <li key={item}><Check size={18} aria-hidden="true" />{item}</li>
        ))}
      </ul>
    ),
  },
  {
    id: 'how-to-clear',
    title: 'How can you remove the cookie and storage?',
    toc: 'Removing them',
    body: (
      <>
        <p>
          You can clear cookies and site data for statewave.ai at any time
          from your browser&rsquo;s settings. The demo widget also has a
          &ldquo;Reset demo&rdquo; control inside the chat that issues a
          fresh visitor ID.
        </p>
        <p>
          If you clear the visitor cookie, the demo will simply start a new
          conversation the next time you open it. Clearing localStorage will
          reset your theme and language preferences to defaults &mdash; the
          site will keep working normally.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    toc: 'Changes',
    body: (
      <p>
        If we ever add cookies that aren&rsquo;t strictly necessary
        &mdash; for example advertising or A/B-testing cookies &mdash;
        we&rsquo;ll update this page and add a proper consent prompt before
        any non-essential cookie is set.
      </p>
    ),
  },
]

export function CookiesPage() {
  return (
    <LegalPage
      path="/cookies"
      title="Cookie Policy"
      sub="One strictly necessary cookie, cookieless analytics, and no advertising or tracking cookies."
      updated={{ iso: '2026-07-07', label: '7 July 2026' }}
      lead={(
        <p>
          statewave.ai is a marketing site for an open-source project. For
          traffic analytics we use Plausible, which is cookieless and stores
          no personal data. We run no advertising or third-party tracking
          cookies. The only cookie we set is a strictly necessary one used by
          the live demo chat widget so the conversation can continue across
          page loads.
        </p>
      )}
      sections={SECTIONS}
    />
  )
}
