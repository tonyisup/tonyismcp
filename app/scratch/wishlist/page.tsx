'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { fetchWishlist, WishlistItem } from './actions';
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function WishlistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [url, setUrl] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>(0);
  const [maxPrice, setMaxPrice] = useState<number | ''>(100);
  const [hideOutsideBudget, setHideOutsideBudget] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState('');
  const [nextPage, setNextPage] = useState<string | null>(null);

  const loadWishlist = useCallback(async (wishlistUrl: string, isLoadMore = false) => {
    if (!wishlistUrl) return;

    setLoading(true);
    setError(null);

    if (!isLoadMore) {
      setItems([]);
      setNextPage(null);
    }

    try {
      const result = await fetchWishlist(wishlistUrl);
      if (result.success) {
        setItems(prev => isLoadMore ? [...prev, ...result.items] : result.items);
        setNextPage(result.nextPageUrl || null);

        if (result.items.length === 0 && !isLoadMore) {
          setError("No items found. This might be because the wishlist is private, or Amazon's layout has changed.");
        }
      } else {
        setError(result.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const wishlistParam = searchParams.get('wishlist');
    // const minParam = searchParams.get('min');
    // const maxParam = searchParams.get('max');
    // const hideParam = searchParams.get('hide');

    // Sync inputs from URL parameters
    // We intentionally do NOT include local state (url, minPrice, maxPrice) in dependencies
    // to allow user editing without the effect reverting changes.
    // The effect should only run when searchParams change (navigation).

    // However, if we only check `searchParams` and update state,
    // we might overwrite user input if the user is typing and something else causes searchParams to update?
    // In this simple app, searchParams only update on navigation/submit.
    // So this is safe.
    // But we should be careful: if we navigate, we want to update state.
    // `wishlistParam !== url` check is still useful to avoid unnecessary state updates if they match.

    if (wishlistParam && wishlistParam !== url) {
      setUrl(wishlistParam);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, lastFetchedUrl, loadWishlist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (url) params.set('wishlist', url);
    if (minPrice !== '') params.set('min', minPrice.toString());
    if (maxPrice !== '') params.set('max', maxPrice.toString());
    if (hideOutsideBudget) params.set('hide', 'true');

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newPath);

    if (url && url === lastFetchedUrl) {
      loadWishlist(url);
    } else if (url && url !== lastFetchedUrl) {
      loadWishlist(url);
      setLastFetchedUrl(url);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Amazon Wishlist Blocker</h1>
          <Link href="/" className="text-sm underline">Back to Home</Link>
        </header>

        <p className="text-muted-foreground">
          Enter a public Amazon Wishlist URL below. Items outside your price range will be blurred.
        </p>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="url" className="text-sm font-medium">Wishlist URL</label>
              <input
                id="url"
                type="url"
                placeholder="https://www.amazon.com/hz/wishlist/ls/..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col space-y-2 flex-1">
                <label htmlFor="minPrice" className="text-sm font-medium">Min Price ($)</label>
                <input
                  id="minPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col space-y-2 flex-1">
                <label htmlFor="maxPrice" className="text-sm font-medium">Max Price ($)</label>
                <input
                  id="maxPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hideOutsideBudget"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={hideOutsideBudget}
                onChange={(e) => setHideOutsideBudget(e.target.checked)}
              />
              <label htmlFor="hideOutsideBudget" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Hide items outside budget
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              {loading ? 'Loading...' : 'Load Wishlist'}
            </button>
          </form>
        </Card>

        {error && (
          <div className="p-4 bg-red-100 text-red-900 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const price = item.price || 0;
            const min = minPrice === '' ? 0 : minPrice;
            const max = maxPrice === '' ? Infinity : maxPrice;
            const isBlurred = price < min || price > max;

            if (hideOutsideBudget && isBlurred) return null;

            return (
              <Card key={item.id} className="overflow-hidden relative group">
                <div className={`transition-all duration-300 ${isBlurred ? 'blur-md opacity-50 grayscale hover:blur-none hover:opacity-100 hover:grayscale-0' : ''}`}>
                  <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.imageUrl} alt={item.title} className="object-contain w-full h-full" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 h-14 mb-2">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    </h3>
                    <p className="text-xl font-bold text-green-600">
                      {item.priceString || 'Price not available'}
                    </p>
                  </CardContent>
                </div>

                {isBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-bold">
                      Outside Budget
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {nextPage && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => loadWishlist(nextPage, true)}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-8 py-2"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8 flex items-center justify-center">Loading...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
