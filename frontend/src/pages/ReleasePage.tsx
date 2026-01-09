import { useMemo, useState } from 'react';
import ProductCardView from '../components/ProductCardView';
import { useAppSelector } from '../hooks/useAppSelector';
import Product from '../models/Product';
import { selectProducts, selectOwnedProductIds } from '../store/slices/productSlice';
import Loading from '../components/Loading';
import { parseDate } from '../utils/dateUtils';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface GroupedProducts {
  [key: string]: Product[];
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

interface ReleasePageProps {
  onProductClick: (isbn: string) => void;
}

function ReleasePage({ onProductClick }: ReleasePageProps) {
  const productMap = useAppSelector(selectProducts);
  const ownedProductIds = useAppSelector(selectOwnedProductIds);

  // Filter and sort states
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [owned, setOwned] = useState<string>('all');

  const groupedProducts = useMemo(() => {
    let products: Product[] = Object.values(productMap).filter(product => product.release_date);

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply owned filter
    if (owned !== 'all') {
      products = products.filter(product => 
        owned === 'owned' ? 
          ownedProductIds.includes(product.isbn) :
          !ownedProductIds.includes(product.isbn)
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return parseDate(b.release_date).getTime() - parseDate(a.release_date).getTime();
        case 'date-asc':
          return parseDate(a.release_date).getTime() - parseDate(b.release_date).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    // Group by month
    const grouped = products.reduce((groups: GroupedProducts, product) => {
      const date = parseDate(product.release_date);
      const monthYear = date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(product);
      return groups;
    }, {});

    return grouped;
  }, [productMap, searchText, sortBy, owned, ownedProductIds]);

  if (Object.keys(productMap).length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Releases</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Releases</h1>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>

        <select
          value={owned}
          onChange={(e) => setOwned(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Products</option>
          <option value="owned">Owned Only</option>
          <option value="not-owned">Not Owned</option>
        </select>
      </div>

      {/* Grouped Products */}
      {Object.entries(groupedProducts).map(([monthYear, products]) => (
        <div key={monthYear} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{monthYear}</h2>
          <ProductCardView 
            products={products.map(p => ({
              ...p,
              onClick: () => onProductClick(p.isbn)
            }))} 
          />
        </div>
      ))}

      {Object.keys(groupedProducts).length === 0 && (
        <p className="text-gray-500 text-center py-8">No products found matching your filters.</p>
      )}
    </div>
  );
}

export default ReleasePage;

