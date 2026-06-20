import type React from "react";

export default function PostContent({ content }: { content: string }) {
  const mediaPattern = /(!\[([^\]]*)\]\(([^)]+)\)|<video\s+controls\s+src="([^"]+)"><\/video>)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mediaPattern.exec(content)) !== null) {
    const text = content.slice(lastIndex, match.index);
    if (text) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {text}
        </span>
      );
    }

    const imageAlt = match[2];
    const imageSrc = match[3];
    const videoSrc = match[4];

    if (imageSrc) {
      parts.push(
        <figure key={`image-${match.index}`} className="my-6 overflow-hidden rounded-2xl border border-border-theme bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={imageAlt || ""} className="w-full object-cover" loading="lazy" />
          {imageAlt && <figcaption className="px-4 py-3 text-sm text-muted-theme">{imageAlt}</figcaption>}
        </figure>
      );
    }

    if (videoSrc) {
      parts.push(
        <video
          key={`video-${match.index}`}
          controls
          src={videoSrc}
          className="my-6 w-full overflow-hidden rounded-2xl border border-border-theme bg-black"
        />
      );
    }

    lastIndex = mediaPattern.lastIndex;
  }

  const tail = content.slice(lastIndex);
  if (tail) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {tail}
      </span>
    );
  }

  return <>{parts}</>;
}
