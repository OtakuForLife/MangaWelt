import Franchise from '../models/Franchise';
import FranchiseCard from './FranchiseCard';

interface FranchiseWithClick extends Franchise {
  onClick?: () => void;
}

interface FranchiseCardViewProps {
  franchises: FranchiseWithClick[];
}

function FranchiseCardView({ franchises = [] }: FranchiseCardViewProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {franchises.map((franchise) => (
        <div key={franchise.id}>
          <FranchiseCard franchise={franchise} onClick={franchise.onClick} />
        </div>
      ))}
    </div>
  );
}
export default FranchiseCardView;

