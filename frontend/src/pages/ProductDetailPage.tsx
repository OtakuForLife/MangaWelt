import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { selectProducts, toggleProductOwned } from '../store/slices/productSlice';
import { Button } from '../components/ui/button';
import { ArrowLeft, CheckCircle, ShoppingCart } from 'lucide-react';
import Loading from '../components/Loading';
import Product from '@/models/Product';

interface ProductDetailPageProps {
  isbn: string;
  onBack: () => void;
}

function ProductDetailPage({ isbn, onBack }: ProductDetailPageProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const product: Product = products[isbn];

  const handleToggleOwned = async () => {
    try {
      await dispatch(toggleProductOwned(isbn)).unwrap();
    } catch (error) {
      console.error('Failed to toggle product ownership:', error);
    }
  };

  if (!product) {
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
    <div className="p-8 max-w-4xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          {product.description && (
            <p className="text-gray-700 mb-4">{product.description}</p>
          )}

          <div className="space-y-2 mb-6">
            <p><strong>ISBN:</strong> {product.isbn}</p>
            {product.release_date && (
              <p><strong>Release Date:</strong> {product.release_date}</p>
            )}
          </div>

          <Button
            onClick={handleToggleOwned}
            variant={product.is_owned ? 'default' : 'secondary'}
            size="lg"
            className="w-full"
          >
            {product.is_owned ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Owned
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Mark as Owned
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

