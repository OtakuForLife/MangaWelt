import { useMemo } from 'react';
import FranchiseCardView from '../components/FranchiseCardView';
import ProductCardView from '../components/ProductCardView';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectFranchises, selectFollowedFranchiseIds } from '../store/slices/franchiseSlice';
import { selectProducts } from '../store/slices/productSlice';
import Loading from '../components/Loading';
import Product from '@/models/Product';

interface BookmarkPageProps {
  onProductClick: (isbn: string) => void;
  onFranchiseClick: (id: string) => void;
}

function BookmarkPage({ onProductClick, onFranchiseClick }: BookmarkPageProps) {
  const franchises = useAppSelector(selectFranchises);
  const followedIds = useAppSelector(selectFollowedFranchiseIds);
  const products = useAppSelector(selectProducts);

  const followedFranchises = useMemo(() => {
    return Object.values(franchises).filter(f => followedIds.includes(f.id));
  }, [franchises, followedIds]);

  const followedProducts = useMemo(() => {
    return Object.values(products).filter((p: Product) => 
      followedIds.includes(p.franchise)
    );
  }, [products, followedIds]);

  if (Object.keys(franchises).length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Bookmarks</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Bookmarks</h1>
      
      {followedFranchises.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No bookmarked franchises yet. Visit the Franchises page to bookmark your favorites!
        </p>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Followed Franchises</h2>
            <FranchiseCardView 
              franchises={followedFranchises.map(f => ({
                ...f,
                onClick: () => onFranchiseClick(f.id)
              }))} 
            />
          </div>

          {followedProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Products from Followed Franchises</h2>
              <ProductCardView 
                products={followedProducts.map(p => ({
                  ...p,
                  onClick: () => onProductClick(p.isbn)
                }))} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookmarkPage;

