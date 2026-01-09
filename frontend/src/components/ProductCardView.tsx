import Product from '../models/Product';
import ProductCard from '../components/ProductCard';

interface ProductWithClick extends Product {
  onClick?: () => void;
}

interface ProductCardViewProps {
  products: ProductWithClick[]
}

function ProductCardView({products}: ProductCardViewProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {products.map((item, index)=>(
        <div key={index}>
          <ProductCard product={item} onClick={item.onClick}/>
        </div>
      ))}
    </div>
  );
}
export default ProductCardView;

