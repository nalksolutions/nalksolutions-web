import Image from 'next/image';
import assets from '../../content/home/assets.generated.json';

const images = new Map(assets.images.map((image) => [image.path, image]));

export function ArchiveImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const image = images.get(src);
  if (!image) throw new Error(`Unregistered public image: ${src}`);
  return (
    <Image
      src={src}
      alt={alt}
      width={image.width}
      height={image.height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
