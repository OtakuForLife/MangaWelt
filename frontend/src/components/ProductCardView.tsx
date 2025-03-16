import { IonCol, IonGrid, IonRow } from '@ionic/react';
import Product from '../models/Product';
import ProductCard from '../components/ProductCard';

interface ProductCardViewProps {
  products: Product[]
}

function ProductCardView({products}: ProductCardViewProps) {
  return (
      <IonGrid>
        <IonRow className='ion-justify-content-center'>
          {products.map((item, index)=>(
            <IonCol size='auto' className='ion-padding' key={index}>
              <ProductCard product={item}/>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
  );
}
export default ProductCardView;