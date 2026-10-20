import { ui, type Locale } from '../../i18n/messages';
import type { EnquiryField } from '../../content/site/schema';
import { contacts } from '../../content/home/site';
import { buttonClassName } from '../site/button-styles';

/** Preserve the enquiry UI without implying that an unconfigured transport sends mail. */
export function EnquiryFields({
  fields,
  buttonLabel,
  id,
  showPlaceholders,
  locale = 'en',
}: {
  fields: readonly EnquiryField[];
  buttonLabel: string;
  id: string;
  showPlaceholders: boolean;
  locale?: Locale;
}) {
  const t = ui(locale);
  return (
    <section className="content-enquiry" aria-label={t('form.region')} data-recovered-control>
      <div className="content-fields">
        {fields.map((field, index) => {
          const label =
            locale === 'ar'
              ? t(
                  field.kind === 'email'
                    ? 'form.email'
                    : field.kind === 'textarea'
                      ? 'form.message'
                      : field.name.startsWith('phone')
                        ? 'form.phone'
                        : 'form.name',
                )
              : field.label;
          const fieldId = `${id}-${index}`;
          const props = {
            id: fieldId,
            name: field.name,
            required: field.required,
            ...(field.defaultValue !== undefined ? { defaultValue: field.defaultValue } : {}),
          };
          return (
            <div key={fieldId}>
              <label htmlFor={fieldId}>{label}</label>
              {field.kind === 'textarea' ? (
                <textarea {...props} rows={5} placeholder={showPlaceholders ? label : undefined} />
              ) : field.kind === 'select' ? (
                <select {...props}>
                  {field.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...props}
                  type={field.kind}
                  dir={field.kind === 'email' || field.name.startsWith('phone') ? 'ltr' : 'auto'}
                  placeholder={showPlaceholders ? label : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className={buttonClassName()}
        disabled
        aria-describedby={`${id}-delivery`}
      >
        {locale === 'ar' ? t('form.send') : buttonLabel}
      </button>
      <p id={`${id}-delivery`}>
        {t('form.sendFallback')} <a href={contacts.email.href}>{contacts.email.label}</a>.
      </p>
    </section>
  );
}
