import Image from 'next/image';
import type { ArticleImage as ImageContent } from '../../content/articles/schema';

export function ArticleImage({
  image,
  priority = false,
}: {
  image: ImageContent;
  priority?: boolean;
}) {
  return (
    <picture>
      {image.variants.length > 0 && (
        <source
          srcSet={image.variants
            .map((variant) => `${encodeURI(variant.src)} ${variant.width}w`)
            .join(', ')}
          sizes={image.sizes ?? undefined}
        />
      )}
      <Image
        src={encodeURI(image.src)}
        alt={image.alt}
        width={image.width}
        height={image.height}
        unoptimized
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="sync"
      />
    </picture>
  );
}
