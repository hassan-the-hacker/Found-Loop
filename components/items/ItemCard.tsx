import Link from 'next/link';
import { MapPin, Calendar, Tag, ArrowRight, ShieldCheck, Box } from 'lucide-react';
import { LostItem, FoundItem } from '@/types/app';
import { formatDate } from '@/lib/utils';

interface ItemCardProps {
  item: (LostItem | FoundItem) & { type?: 'LOST' | 'FOUND' };
  type?: 'LOST' | 'FOUND';
}

export default function ItemCard({ item, type }: ItemCardProps) {
  const isLost = type === 'LOST' || ('lost_date' in item);
  const dateStr = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;
  const itemUrl = `/items/${item.id}?type=${isLost ? 'LOST' : 'FOUND'}`;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-lg border border-border-subtle bg-surface transition-all hover:border-border-focus/40 hover:shadow-sm">
      <div>
        {/* Thumbnail Preview */}
        <Link href={itemUrl} className="block relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle border-b border-border-subtle cursor-pointer">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-text-muted">
              <Box className="h-10 w-10 stroke-[1.5]" />
              <span className="mt-1 text-[11px] font-medium">No Photograph</span>
            </div>
          )}

          {/* Badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-bold tracking-wider shadow-sm ${
                isLost
                  ? 'bg-status-lost text-white'
                  : 'bg-status-found text-white'
              }`}
            >
              {isLost ? 'LOST' : 'FOUND'}
            </span>
            <span className="rounded bg-surface/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-text-primary shadow-sm border border-border-subtle">
              {item.category}
            </span>
          </div>

          {/* Color tag */}
          <div className="absolute right-3 bottom-2">
            <span className="rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
              {item.primary_color}
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <h3 className="text-base font-semibold text-text-primary line-clamp-1">
            <Link
              href={itemUrl}
              className="hover:text-accent transition-colors hover:underline"
              title={item.title}
            >
              {item.title}
            </Link>
          </h3>

          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="space-y-1 pt-1 border-t border-border-subtle/60 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
              <span className="line-clamp-1">
                {item.approximate_location}, {item.city}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                <span>{formatDate(dateStr)}</span>
              </span>

              {item.brand && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3 shrink-0" />
                  <span className="font-medium text-text-secondary">{item.brand}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-border-subtle bg-surface-subtle/50 px-4 py-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-status-verified shrink-0" />
          <span className="truncate">{isLost ? 'Verification Required' : 'Available for Claim'}</span>
        </span>

        <Link
          href={itemUrl}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-accent-hover hover:shadow-sm active:scale-97 shrink-0"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

