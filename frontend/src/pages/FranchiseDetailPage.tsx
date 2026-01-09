import { useMemo } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { selectFranchises, toggleFranchiseFollow, selectFollowedFranchiseIds } from '../store/slices/franchiseSlice';
import { selectProducts } from '../store/slices/productSlice';
import ProductCardView from '../components/ProductCardView';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bookmark } from 'lucide-react';
import Loading from '../components/Loading';

interface FranchiseDetailPageProps {
  id: string;
  onBack: () => void;
  onProductClick: (isbn: string) => void;
}

function FranchiseDetailPage({ id, onBack, onProductClick }: FranchiseDetailPageProps) {
  const dispatch = useAppDispatch();
  const franchises = useAppSelector(selectFranchises);
  const products = useAppSelector(selectProducts);
  const followedIds = useAppSelector(selectFollowedFranchiseIds);
  
  const franchise = franchises[id];
  const isFollowing = followedIds.includes(id);

  const franchiseProducts = useMemo(() => {
    return Object.values(products).filter(p => p.franchise === id);
  }, [products, id]);

  const handleToggleFollow = async () => {
    try {
      await dispatch(toggleFranchiseFollow(id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle franchise follow:', error);
    }
  };

  if (!franchise) {
    return (
      <div className="p-8">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Franchise Image */}
        <div>
          {franchise.image && (
            <img
              src={franchise.image}
              alt={franchise.title}
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          )}
        </div>

        {/* Franchise Details */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{franchise.title}</h1>
          
          {franchise.description && (
            <p className="text-gray-700 mb-6">{franchise.description}</p>
          )}

          <Button
            onClick={handleToggleFollow}
            variant={isFollowing ? 'default' : 'secondary'}
            size="lg"
          >
            <Bookmark className={`w-5 h-5 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
      </div>

      {/* Products in this franchise */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Products ({franchiseProducts.length})
        </h2>
        {franchiseProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products in this franchise yet.</p>
        ) : (
          <ProductCardView 
            products={franchiseProducts.map(p => ({
              ...p,
              onClick: () => onProductClick(p.isbn)
            }))} 
          />
        )}
      </div>
    </div>
  );
}

export default FranchiseDetailPage;

