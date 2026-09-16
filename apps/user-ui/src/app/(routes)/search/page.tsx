'use client';

// import { useSearchParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { useSearchParams } from 'next/navigation';
import SearchResultsPage from '../SearchResultsPage'; // your results component
import { SearchProduct } from '../../../shared/components/SmartSearchBar';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosProductService.get('/product/get-all-products').then((res) => {
      const products: SearchProduct[] = res.data.products;
      setAllProducts(products);

      if (query) {
        const fuse = new Fuse(products, {
          keys: ['title', 'category'],
          threshold: 0.4,
        });
        const fuseResults = fuse.search(query);
        setResults(fuseResults.map((r) => r.item));
      }
      setLoading(false);
    });
  }, [query]);

  return (
    <SearchResultsPage
      results={results}
      allProducts={allProducts}
      loading={loading}
    />
  );
}
