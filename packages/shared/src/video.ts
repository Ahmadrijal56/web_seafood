export function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return match ? match[1]! : null;
}

export function tiktokId(url: string): string | null {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1]! : null;
}

export function videoEmbedUrl(platform: string, url: string): string | null {
  if (platform === "youtube") {
    const id = youtubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (platform === "tiktok") {
    const id = tiktokId(url);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }
  return null;
}

export function videoThumbnail(platform: string, url: string, fallback?: string | null): string | null {
  if (fallback) return fallback;
  if (platform === "youtube") {
    const id = youtubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  }
  return null;
}
