import { expect, type Page } from '@playwright/test';

/** Applied to each retained page by the coverage suite; no source labels are rewritten. */
export async function assertSharedActions(page: Page) {
  const width = page.viewportSize()!.width;
  const fontSize = width > 1180 ? '16px' : width > 767 ? '15px' : '14px';
  const actions = page.locator(
    'main :is(.content-service-button,.content-company-button,.content-company-feature-button,.content-listing-read-more)',
  );
  for (const action of await actions.all()) {
    await expect(action).toHaveClass(/(?:^|\s)site-button(?:\s|$)/u);
    await expect(action).toHaveCSS('border-radius', '10px');
    await expect(action).toHaveCSS('font-size', fontSize);
    await expect(action).toHaveCSS('font-weight', '700');
    await expect(action).toHaveCSS('padding', '13px 30px');
    expect(await action.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
      'Manrope',
    );
    if (await action.isVisible()) {
      const href = await action.getAttribute('href');
      if (href !== null) expect(href).not.toBe('#');
      expect((await action.textContent())?.trim()).not.toBe('');
    }
  }
  for (const button of await page.locator('.content-enquiry > button').all()) {
    await expect(button).toHaveClass(/(?:^|\s)site-button(?:\s|$)/u);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-describedby', /-delivery$/u);
    await expect(button).toHaveCSS('font-size', fontSize);
    await expect(button).toHaveCSS('font-weight', '700');
    await expect(button).toHaveCSS('padding', '13px 30px');
  }
}
