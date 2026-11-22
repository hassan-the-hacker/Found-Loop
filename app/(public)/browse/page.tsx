'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ITEM_CATEGORIES, INDIAN_STATES, getCitiesForState, INDIAN_CITIES, ITEM_COLORS } from '@/lib/constants';
import ItemCard from '@/components/items/ItemCard';
import Select from '@/components/ui/Select';
import { LostItem, FoundItem } from '@/types/app';

function BrowseCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters from URL or state
  const initialType = (searchParams.get('type') as 'ALL' | 'LOST' | 'FOUND') || 'ALL';
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialState = searchParams.get('state') || 'ALL';
  const initialCity = searchParams.get('city') || 'ALL';

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>(initialType);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [stateFilter, setStateFilter] = useState(initialState);
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [colorFilter, setColorFilter] = useState('ALL');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleStateFilterChange = (newState: string) => {
    setStateFilter(newState);
    setCityFilter('ALL');
  };

  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch live items
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const [lostRes, foundRes] = await Promise.all([
          supabase.from('lost_items').select('*').order('created_at', { ascending: false }),
          supabase.from('found_items').select('*').order('created_at', { ascending: false }),
        ]);

        if (lostRes.data) setLostItems(lostRes.data as LostItem[]);
        if (foundRes.data) setFoundItems(foundRes.data as FoundItem[]);
      } catch {
        // Fallback for offline demo
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [supabase]);

  // Combine & Filter Items
  const filteredItems = useMemo(() => {
    let combined: ((LostItem | FoundItem) & { itemType: 'LOST' | 'FOUND' })[] = [];

    if (typeFilter === 'ALL' || typeFilter === 'LOST') {
      combined = [...combined, ...lostItems.map((i) => ({ ...i, itemType: 'LOST' as const }))];
    }
    if (typeFilter === 'ALL' || typeFilter === 'FOUND') {
      combined = [...combined, ...foundItems.map((i) => ({ ...i, itemType: 'FOUND' as const }))];
    }

    return combined.filter((item) => {
      // Search text match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textToSearch = `${item.title} ${item.description} ${item.brand || ''} ${item.city} ${item.approximate_location}`.toLowerCase();
        if (!textToSearch.includes(q)) return false;
      }

      // Category match
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // State match
      if (stateFilter !== 'ALL' && (item as any).state && (item as any).state !== stateFilter) {
        return false;
      }

      // City match
      if (cityFilter !== 'ALL' && item.city !== cityFilter) {
        return false;
      }

      // Color match
      if (colorFilter !== 'ALL' && item.primary_color !== colorFilter) {
        return false;
      }

      return true;
    });
  }, [lostItems, foundItems, typeFilter, searchQuery, categoryFilter, stateFilter, cityFilter, colorFilter]);

  const clearAllFilters = () => {
    setTypeFilter('ALL');
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStateFilter('ALL');
    setCityFilter('ALL');
    setColorFilter('ALL');
    router.push('/browse');
  };

  const hasActiveFilters =
    typeFilter !== 'ALL' ||
    searchQuery !== '' ||
    categoryFilter !== 'ALL' ||
    stateFilter !== 'ALL' ||
    cityFilter !== 'ALL' ||
    colorFilter !== 'ALL';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner & Search */}
      <div className="border-b border-border-subtle pb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Browse Community Listings
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Search across verified lost reports and discovered belongings reported by finders.
          </p>
        </div>

        {/* Search bar & Type toggles */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, model, brand, or landmark..."
              className="w-full rounded-md border border-[#D1D5DB] py-2 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Status Type Segmented Control */}
            <div className="flex rounded-md border border-border-subtle bg-surface-subtle p-0.5 text-xs font-semibold">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`rounded px-3 py-1.5 transition-colors ${typeFilter === 'ALL'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                All Items
              </button>
              <button
                onClick={() => setTypeFilter('LOST')}
                className={`rounded px-3 py-1.5 transition-colors ${typeFilter === 'LOST'
                    ? 'bg-status-lost text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Lost Only
              </button>
              <button
                onClick={() => setTypeFilter('FOUND')}
                className={`rounded px-3 py-1.5 transition-colors ${typeFilter === 'FOUND'
                    ? 'bg-status-found text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Found Only
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-primary sm:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-primary">
              <Filter className="h-3.5 w-3.5" />
              Filter Catalog
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-accent hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">Category</label>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              type="category"
              searchable={true}
              searchPlaceholder="Search category..."
              options={[
                { value: 'ALL', label: 'All Categories' },
                ...ITEM_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>

          {/* State Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">State / UT</label>
            <Select
              value={stateFilter}
              onChange={handleStateFilterChange}
              type="state"
              searchable={true}
              searchPlaceholder="Search State / UT..."
              options={[
                { value: 'ALL', label: 'All States & UTs' },
                ...INDIAN_STATES.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>

          {/* City Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">City / Region</label>
            <Select
              value={cityFilter}
              onChange={setCityFilter}
              type="city"
              searchable={true}
              searchPlaceholder="Search City..."
              options={[
                { value: 'ALL', label: stateFilter === 'ALL' ? 'All Indian Cities' : `All Cities in ${stateFilter}` },
                ...(stateFilter === 'ALL'
                  ? INDIAN_CITIES.map((c) => ({ value: c, label: c }))
                  : getCitiesForState(stateFilter).map((c) => ({ value: c, label: c }))),
              ]}
            />
          </div>

          {/* Color Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">Primary Color</label>
            <Select
              value={colorFilter}
              onChange={setColorFilter}
              type="color"
              options={[
                { value: 'ALL', label: 'Any Color' },
                ...ITEM_COLORS.map((col) => ({ value: col, label: col })),
              ]}
            />
          </div>

          {/* Safe Community Notice */}
          <div className="rounded-md border border-border-subtle bg-surface-subtle p-3 text-[11px] text-text-secondary leading-relaxed space-y-1">
            <p className="font-semibold text-text-primary">Notice</p>
            <p>
              Exact serial numbers and secret marks are masked to prevent unauthorized claim fraud.
            </p>
          </div>
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>
              Showing <strong>{filteredItems.length}</strong> matching reports
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-72 animate-pulse rounded-lg border border-border-subtle bg-surface-subtle/50"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} type={item.itemType} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-subtle bg-surface p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-text-muted" />
              <h3 className="mt-3 text-base font-semibold text-text-primary">No Matching Items Found</h3>
              <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                Try widening your search terms or clearing specific category and city filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-md border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-subtle"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-text-muted">Loading catalog...</div>}>
      <BrowseCatalog />
    </Suspense>
  );
}

