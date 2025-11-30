'use server';

import * as cheerio from 'cheerio';

export interface WishlistItem {
  id: string;
  title: string;
  price: number | null;
  priceString: string;
  imageUrl: string;
  link: string;
}

export interface FetchWishlistResult {
  success: boolean;
  items: WishlistItem[];
  nextPageUrl?: string | null;
  error?: string;
}

export async function fetchWishlist(url: string): Promise<FetchWishlistResult> {
  try {
    if (!url.includes('amazon.com')) {
      return { success: false, items: [], error: 'Please provide a valid Amazon.com wishlist URL.' };
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return { success: false, items: [], error: `Failed to fetch wishlist. Status: ${response.status}` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: WishlistItem[] = [];

    // Amazon Wishlist selectors are tricky and change.
    // Typical structure: <li data-id="..."> ... </li> or <div id="g-items"> ... </div>
    // We will look for elements that look like items.

    // Select based on common wishlist item containers
    const listItems = $('li[data-id], div[data-itemid]');

    listItems.each((_, element) => {
      const el = $(element);
      const id = el.attr('data-id') || el.attr('data-itemid') || `item-${Math.random()}`;

      // Title
      const title = el.find('a[id^="itemName_"]').attr('title') ||
                  el.find('h2 a').text().trim() ||
                  el.find('h3 a').text().trim();

      // Image
      const imageUrl = el.find('img').attr('src') || '';

      // Link
      let link = el.find('a[id^="itemName_"]').attr('href') ||
                 el.find('h2 a').attr('href') ||
                 '';

      if (link && !link.startsWith('http')) {
        link = 'https://www.amazon.com' + link;
      }

      // Price
      // Price can be in multiple places depending on view (list vs grid)
      // Usually in <span class="a-price"><span class="a-offscreen">$12.34</span></span>
      let priceString = el.find('.a-price .a-offscreen').first().text().trim();

      if (!priceString) {
        // Fallback for some layouts
        priceString = el.find('.a-color-price').text().trim();
      }

      // Extract number from price string
      let price: number | null = null;
      if (priceString) {
        const match = priceString.match(/[\d,.]+/);
        if (match) {
          price = parseFloat(match[0].replace(/,/g, ''));
        }
      }

      if (title) {
        items.push({
          id,
          title,
          price,
          priceString,
          imageUrl,
          link,
        });
      }
    });

    // Pagination logic
    let nextPageUrl: string | null = null;
    const nextLink = $('.a-pagination li.a-last a').attr('href');
    if (nextLink) {
        if (nextLink.startsWith('http')) {
            nextPageUrl = nextLink;
        } else {
            nextPageUrl = 'https://www.amazon.com' + nextLink;
        }
    }

    return { success: true, items, nextPageUrl };

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { success: false, items: [], error: 'An error occurred while fetching the wishlist.' };
  }
}
