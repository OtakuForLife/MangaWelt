import { memo } from 'react';
import { BaseCard } from './common/Card/BaseCard';
import Product from '../models/Product';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIsProductOwned } from '../store/slices/productSlice';
import { CheckCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

function ProductCard({product, onClick}: ProductCardProps) {
  const isOwned = useAppSelector(state => selectIsProductOwned(state, product.isbn));

  return (
    <BaseCard
      title={product.title}
      onClick={onClick}
      className='w-43 sm:w-70 md:w-60 lg:w-60 p-4'
      imageUrl={product.image}
      imageAlt={product.title}
      topRightContent={
        isOwned ? (
          <div className="absolute top-2 right-2 z-10">
            <CheckCircle
              className="w-6 h-6 text-green-500 bg-white rounded-full"
            />
          </div>
        ) : null
      }
    >
      <div className='h-5 md:h-10 text-sm'>
        Release: {product.release_date}
      </div>
    </BaseCard>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export default memo(ProductCard);

