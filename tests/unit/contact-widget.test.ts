import { expect, it, vi } from 'vitest';
import {
  createContactWidget,
  type TurnstileApi,
} from '../../src/components/content/contact-turnstile';

it('fits narrow forms, changes mode only at the real size boundary and cleans up on navigation', () => {
  let width = 240;
  const element = {
    get clientWidth() {
      return width;
    },
  } as HTMLElement;
  let sequence = 0;
  const api = { render: vi.fn<TurnstileApi['render']>(() => String(++sequence)), remove: vi.fn() };
  const onToken = vi.fn();
  const widget = createContactWidget(element, api, {
    siteKey: 'key',
    locale: 'ar',
    onToken,
    onUnavailable: vi.fn(),
  });
  expect(api.render.mock.calls[0]?.[1]).toMatchObject({
    size: 'compact',
    language: 'ar',
    action: 'contact',
  });
  width = 280;
  widget.resize();
  expect(api.render).toHaveBeenCalledTimes(1);
  width = 500;
  widget.resize();
  expect(api.remove).toHaveBeenCalledWith('1');
  expect(api.render.mock.calls[1]?.[1]).toMatchObject({ size: 'flexible' });
  expect(onToken).toHaveBeenLastCalledWith('');
  const callbacks = api.render.mock.calls[1]![1];
  callbacks.callback('verified');
  callbacks['expired-callback']();
  expect(onToken.mock.calls.slice(-2)).toEqual([['verified'], ['']]);
  widget.dispose();
  widget.dispose();
  widget.resize();
  expect(api.remove.mock.calls).toEqual([['1'], ['2']]);
  expect(api.render).toHaveBeenCalledTimes(2);
});

it('reports a widget configuration/load failure without crashing the contact page', () => {
  const onUnavailable = vi.fn();
  const api = {
    render: vi.fn(() => {
      throw new Error('Widget unavailable');
    }),
    remove: vi.fn(),
  };
  const widget = createContactWidget({ clientWidth: 500 } as HTMLElement, api, {
    siteKey: 'invalid',
    locale: 'en',
    onToken: vi.fn(),
    onUnavailable,
  });
  expect(onUnavailable).toHaveBeenCalledOnce();
  widget.dispose();
  expect(api.remove).not.toHaveBeenCalled();
});
