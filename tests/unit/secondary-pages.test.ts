import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { secondaryPageLayouts } from '../../src/content/secondary/layouts';
import { documentSchema } from '../../src/content/site/schema';
import assets from '../../src/content/secondary/assets.generated.json';
import publishedAssets from '../../src/content/site/assets.generated.json';
import { EnquiryFields } from '../../src/components/content/enquiry-fields';
import { DocumentBody } from '../../src/components/content/document-body';

it('omits inherited phone links while preserving email and unrelated numbered content', () => {
  const html = renderToStaticMarkup(
    createElement(DocumentBody, {
      prefix: 'contact-policy',
      context: { locale: 'en', identities: [], searchable: [] },
      nodes: [
        {
          type: 'element',
          tag: 'a',
          variant: null,
          attributes: { href: 'tel:+(012)%204680-396' },
          children: [{ type: 'text', text: '(012) 4680-396' }],
        },
        {
          type: 'element',
          tag: 'a',
          variant: null,
          attributes: { href: 'mailto:info@nalksolutions.com' },
          children: [{ type: 'text', text: 'Email the team' }],
        },
        { type: 'text', text: '120 projects' },
      ],
    }),
  );
  expect(html).not.toContain('tel:');
  expect(html).not.toContain('4680-396');
  expect(html).toContain('mailto:info@nalksolutions.com');
  expect(html).toContain('120 projects');
});

it('requires each secondary layout and publishes every recovered background', () => {
  expect(Object.keys(secondaryPageLayouts)).toHaveLength(8);
  for (const [id, layout] of Object.entries(secondaryPageLayouts)) {
    const document = JSON.parse(readFileSync(`src/content/site/documents/${id}.json`, 'utf8'));
    expect(documentSchema.parse(document).secondaryLayout).toBe(layout);
    expect(documentSchema.safeParse({ ...document, secondaryLayout: undefined }).success).toBe(
      false,
    );
    for (const asset of Object.values(assets[id as keyof typeof assets]))
      expect(publishedAssets.some((entry) => entry.path === asset)).toBe(true);
  }
});

it('server renders the recorded select default and honest delivery alternative', () => {
  const html = renderToStaticMarkup(
    createElement(EnquiryFields, {
      id: 'appointment',
      buttonLabel: 'Schedule a Meeting',
      showPlaceholders: true,
      fields: [
        {
          kind: 'select',
          label: 'Hour',
          name: 'hour',
          required: true,
          options: ['00', '08', '12'],
          defaultValue: '08',
        },
      ],
    }),
  );
  expect(html).toContain('<option value="08" selected="">08</option>');
  expect(html).toContain('disabled=""');
  expect(html).toContain('mailto:info@nalksolutions.com');
});
