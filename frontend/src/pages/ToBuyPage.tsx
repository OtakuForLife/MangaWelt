import { useMemo, useState } from 'react';
import ProductCardView from '../components/ProductCardView';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectProductsToBuy } from '../store/slices/productSlice';
import Loading from '../components/Loading';
import { Input } from '../components/ui/input';

interface ToBuyPageProps {
  onProductClick: (isbn: string) => void;
}

function ToBuyPage({ onProductClick }: ToBuyPageProps) {
  const productsToBuy = useAppSelector(selectProductsToBuy);
  const [searchText, setSearchText] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchText) return productsToBuy;
    
    const searchLower = searchText.toLowerCase();
    return productsToBuy.filter(product => 
      product.title.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  }, [productsToBuy, searchText]);

  if (productsToBuy.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">To Buy</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">To Buy</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search products to buy..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {searchText ? 'No products found matching your search.' : 'All products are owned!'}
        </p>
      ) : (
        <ProductCardView 
          products={filteredProducts.map(p => ({
            ...p,
            onClick: () => onProductClick(p.isbn)
          }))} 
        />
      )}
    </div>
  );
}

export default ToBuyPage;

