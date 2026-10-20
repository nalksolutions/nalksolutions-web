import { PUBLIC_ORIGIN } from '../env/config';

/** D-14: share the current public identity, independently of canonical metadata absence. */
export function articleShareUrls(publicUrl: string, title: string): Record<string, string> {
  const url = new URL(publicUrl);
  if (url.origin !== PUBLIC_ORIGIN || url.username || url.password || url.search || url.hash) {
    throw new Error('Sharing requires an approved public URL');
  }
  const share = (endpoint: string, values: Record<string, string>) => {
    const target = new URL(endpoint);
    target.search = new URLSearchParams(values).toString();
    return target.href;
  };
  return {
    facebook: share('https://www.facebook.com/sharer.php', { u: publicUrl }),
    x: share('https://twitter.com/intent/tweet', { url: publicUrl, text: title }),
    linkedin: share('https://www.linkedin.com/shareArticle', {
      mini: 'true',
      url: publicUrl,
      title,
    }),
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(publicUrl)}`,
  };
}
