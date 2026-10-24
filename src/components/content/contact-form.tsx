'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ui, type Locale } from '../../i18n/messages';
import { contacts } from '../../content/home/site';
import type { EnquiryField } from '../../content/site/schema';
import {
  contactLimits,
  type ContactField,
  type ContactFailure,
  type ContactResult,
} from '../../lib/contact/contract';
import { buttonClassName } from '../site/button-styles';
import { ContactTurnstile } from './contact-turnstile';

function fieldKey(field: EnquiryField): ContactField {
  if (field.kind === 'email') return 'email';
  if (field.kind === 'textarea') return 'message';
  return field.name.startsWith('phone') ? 'phone' : 'name';
}
type State = 'idle' | 'sending' | 'success' | ContactFailure;
export function ContactForm({
  fields,
  id,
  showPlaceholders,
  locale,
  siteKey,
}: {
  fields: readonly EnquiryField[];
  id: string;
  showPlaceholders: boolean;
  locale: Locale;
  siteKey: string | null;
}) {
  const t = ui(locale);
  const [state, setState] = useState<State>('idle');
  const [invalid, setInvalid] = useState<ContactField[]>([]);
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  const pending = useRef(false);
  const operation = useRef<{ fingerprint: string; id: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const receivedToken = useCallback((value: string) => {
    setToken(value);
    setVerificationFailed(false);
  }, []);
  const unavailable = useCallback(() => {
    setToken('');
    setVerificationFailed(true);
  }, []);

  function announce(next: State) {
    setState(next);
    requestAnimationFrame(() => feedback.current?.focus());
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (siteKey && !token) {
      announce('verification');
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(
      fields.map((field) => [fieldKey(field), String(data.get(field.name) ?? '').trim()]),
    );
    const fingerprint = JSON.stringify(values);
    if (!operation.current || operation.current.fingerprint !== fingerprint)
      operation.current = { fingerprint, id: crypto.randomUUID() };
    pending.current = true;
    setInvalid([]);
    setState('sending');
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch('/api/contact/', {
        method: 'POST',
        credentials: 'same-origin',
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(30_000)]),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          locale,
          pagePath: locale === 'ar' ? '/ar/contacts/' : '/contacts/',
          submissionId: operation.current.id,
          website: String(data.get('website') ?? ''),
          turnstileToken: token,
        }),
      });
      const result = (await response.json()) as ContactResult;
      if (response.ok && result.ok === true) {
        form.reset();
        operation.current = null;
        announce('success');
      } else {
        const failure = result.ok === false ? result : null;
        setInvalid(failure?.fields ?? []);
        const code = failure?.code;
        announce(
          code &&
            ['invalid', 'verification', 'rate_limited', 'unavailable', 'delivery_failed'].includes(
              code,
            )
            ? code
            : 'delivery_failed',
        );
      }
    } catch {
      if (!abort.signal.aborted) announce('delivery_failed');
    } finally {
      pending.current = false;
      if (!abort.signal.aborted && siteKey) {
        setToken('');
        setResetKey((value) => value + 1);
      }
    }
  }
  const feedbackKey = state === 'idle' ? 'help' : state;
  return (
    <form
      className="content-enquiry contact-live-form"
      aria-label={t('form.region')}
      data-contact-form
      data-recovered-control
      action="/api/contact/"
      method="post"
      onSubmit={submit}
      aria-busy={state === 'sending'}
    >
      <fieldset disabled={state === 'sending'}>
        <legend className="sr-only">{t('form.region')}</legend>
        <div className="content-fields">
          {fields.map((field, index) => {
            const key = fieldKey(field);
            const label = t(`form.${key}`);
            const inputId = `${id}-${index}`;
            const props = {
              id: inputId,
              name: field.name,
              required: key !== 'phone',
              maxLength: contactLimits[key],
              'aria-invalid': invalid.includes(key) ? (true as const) : undefined,
              'aria-describedby': invalid.includes(key) ? `${inputId}-error` : undefined,
              placeholder: showPlaceholders ? label : undefined,
            };
            return (
              <div key={key}>
                <label htmlFor={inputId}>
                  {label}
                  {key !== 'phone' ? ' *' : ` (${t('form.optional')})`}
                </label>
                {key === 'message' ? (
                  <textarea {...props} rows={5} minLength={10} dir="auto" />
                ) : (
                  <input
                    {...props}
                    type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                    autoComplete={key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'email'}
                    minLength={key === 'name' ? 2 : undefined}
                    dir={key === 'name' ? 'auto' : 'ltr'}
                  />
                )}
                {invalid.includes(key) && (
                  <p id={`${inputId}-error`} className="contact-field-error">
                    {t('form.fieldInvalid')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="contact-honeypot" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            name="website"
            type="text"
            autoComplete="off"
            readOnly
            defaultValue=""
            tabIndex={-1}
            maxLength={200}
          />
        </div>
        {siteKey && (
          <ContactTurnstile
            siteKey={siteKey}
            locale={locale}
            resetKey={resetKey}
            onToken={receivedToken}
            onUnavailable={unavailable}
          />
        )}
        {verificationFailed && <p role="status">{t('form.verificationUnavailable')}</p>}
        <button
          type="submit"
          className={buttonClassName()}
          disabled={state === 'sending'}
          aria-describedby={`${id}-delivery`}
        >
          {t(state === 'sending' ? 'form.sending' : 'form.send')}
        </button>
      </fieldset>
      <p
        id={`${id}-delivery`}
        ref={feedback}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="contact-form-feedback"
        data-state={state}
      >
        {t(`form.${feedbackKey}`)}
      </p>
      <p className="contact-email-alternative">
        {t('form.emailAlternative')}{' '}
        <a href={contacts.email.href} dir="ltr">
          {contacts.email.label}
        </a>
        .
      </p>
      <noscript>
        <style>{'.contact-live-form fieldset { display: none; }'}</style>
        <p>{t('form.noScript')}</p>
      </noscript>
    </form>
  );
}
