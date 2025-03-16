import { IonCol, IonGrid, IonRow } from '@ionic/react';
import Franchise from '../models/Franchise';
import FranchiseCard from './FranchiseCard';


interface FranchiseCardViewProps {
  franchises: Franchise[];
}

function FranchiseCardView({ franchises = [] }: FranchiseCardViewProps) {
  return (
    <IonGrid>
      <IonRow className='ion-justify-content-center'>
        {franchises.map((franchise) => (
          <IonCol size='auto' className='ion-padding' key={franchise.id}>
            <FranchiseCard franchise={franchise} />
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  );
}
export default FranchiseCardView;
