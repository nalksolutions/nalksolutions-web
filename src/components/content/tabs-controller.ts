/** Scoped progressive enhancement; no captured scripts or document-wide listeners. */
export function mountTabs(root: HTMLElement) {
  const desktop = [...root.querySelectorAll<HTMLButtonElement>('.content-service-tab')];
  const mobile = [...root.querySelectorAll<HTMLButtonElement>('.content-service-tab-mobile')];
  const panels = [...root.querySelectorAll<HTMLElement>('.content-service-tab-panel')];
  const list = root.querySelector<HTMLElement>('.content-service-tabs-list');
  if (
    !list ||
    !panels.length ||
    desktop.length !== panels.length ||
    mobile.length !== panels.length
  )
    return;
  const view = root.ownerDocument.defaultView;
  if (!view) return;
  const rtl = view.getComputedStyle(root).direction === 'rtl';
  const small = view.matchMedia('(max-width: 767px)');
  const events = new AbortController();
  let selected: number | null = 0;
  function update() {
    list?.setAttribute('role', 'tablist');
    list?.setAttribute('aria-label', rtl ? 'خطوات تنفيذ الخدمة' : 'Service process');
    panels.forEach((panel, index) => {
      const tab = desktop[index];
      const disclosure = mobile[index];
      if (!tab || !disclosure) return;
      const active = selected === index;
      disclosure.id = `${panel.id}-mobile-title`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('aria-controls', panel.id);
      tab.tabIndex = active ? 0 : -1;
      disclosure.setAttribute('aria-expanded', String(active));
      disclosure.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', small.matches ? 'region' : 'tabpanel');
      panel.setAttribute('aria-labelledby', small.matches ? disclosure.id : tab.id);
      panel.tabIndex = 0;
      panel.hidden = !active;
    });
  }
  desktop.forEach((tab, index) => {
    tab.addEventListener(
      'click',
      () => {
        selected = index;
        update();
      },
      { signal: events.signal },
    );
    tab.addEventListener(
      'keydown',
      (event) => {
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? desktop.length - 1
              : event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
                ? (index + 1) % desktop.length
                : event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')
                  ? (index - 1 + desktop.length) % desktop.length
                  : null;
        if (next === null) return;
        event.preventDefault();
        selected = next;
        update();
        desktop[next]?.focus();
      },
      { signal: events.signal },
    );
  });
  mobile.forEach((button, index) =>
    button.addEventListener(
      'click',
      () => {
        selected = selected === index ? null : index;
        update();
      },
      { signal: events.signal },
    ),
  );
  function resize() {
    const focused = root.ownerDocument.activeElement;
    const index = [...desktop, ...mobile].indexOf(focused as HTMLButtonElement) % desktop.length;
    if (selected === null && !small.matches) selected = 0;
    update();
    if (index >= 0) (small.matches ? mobile : desktop)[selected ?? index]?.focus();
  }
  small.addEventListener('change', resize);
  update();
  root.dataset.enhanced = 'true';
  return () => {
    events.abort();
    small.removeEventListener('change', resize);
    delete root.dataset.enhanced;
    for (const panel of panels) {
      panel.hidden = false;
      for (const attribute of ['role', 'aria-labelledby', 'tabindex'])
        panel.removeAttribute(attribute);
    }
    for (const tab of [...desktop, ...mobile])
      for (const attribute of [
        'role',
        'aria-selected',
        'aria-controls',
        'aria-expanded',
        'tabindex',
      ])
        tab.removeAttribute(attribute);
    list.removeAttribute('role');
    list.removeAttribute('aria-label');
  };
}
