"use client";

import { videoEmbedUrl, videoThumbnail, type Video } from "@sfs/shared";
import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TikTokIcon, YouTubeIcon } from "./icons";

function VideoTile({ video, featured }: { video: Video; featured?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbedUrl(video.platform, video.url);
  const thumb = videoThumbnail(video.platform, video.url, video.thumbnail_url);
  return (
    <div className={cn("group relative aspect-video overflow-hidden bg-navy shadow-lg", featured ? "rounded-3xl" : "rounded-2xl")}>
      {playing && embed ? (
        <iframe
          src={`${embed}?autoplay=1&rel=0`}
          title={video.title ?? "Video Syauqi Fresh Seafood"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => (embed ? setPlaying(true) : window.open(video.url, "_blank"))}
          className="absolute inset-0 cursor-pointer text-left"
          aria-label={`Putar video: ${video.title}`}
        >
          {thumb && <Image src={thumb} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
          <span className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-coral shadow-xl transition group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4 text-white">
            {video.platform === "tiktok" ? <TikTokIcon size={18} /> : <YouTubeIcon size={20} className="text-red-500" />}
            <span className={cn("line-clamp-2 font-bold", featured ? "text-lg" : "text-sm")}>{video.title}</span>
          </span>
        </button>
      )}
    </div>
  );
}

export function VideoGrid({ videos, featureFirst = true }: { videos: Video[]; featureFirst?: boolean }) {
  const [first, ...rest] = videos;
  if (!first) return null;
  if (!featureFirst) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoTile key={video.id} video={video} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <VideoTile video={first} featured />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {rest.slice(0, 4).map((video) => (
          <VideoTile key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
