import { BaseCard } from './common/Card/BaseCard';
import Product from '../models/Product';
import { useAppSelector } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { selectIsProductOwned } from '../redux/slices/productSlice';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';

interface ProductCardProps {
  product: Product
}

function ProductCard({product}: ProductCardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOwned = useAppSelector(state => selectIsProductOwned(state, product.isbn));

  return (
    <BaseCard 
      title={product.title}
      href={`/app/product/${product.isbn}`}
      className='w-43 sm:w-70 md:w-60 lg:w-60 ion-padding'
      imageUrl={product.image}
      imageAlt={product.title}
      topRightContent={
        isAuthenticated && isOwned ? (
          <div className="absolute top-2 right-2 z-10">
            <IonIcon 
              icon={checkmarkCircle} 
              color="success" 
              className="text-xl"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '50%' 
              }}
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

export default ProductCard;
