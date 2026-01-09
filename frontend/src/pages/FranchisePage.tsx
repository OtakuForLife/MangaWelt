import { useMemo, useState } from 'react';
import FranchiseCardView from '../components/FranchiseCardView';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectFranchises } from '../store/slices/franchiseSlice';
import Loading from '../components/Loading';
import { Input } from '../components/ui/input';

interface FranchisePageProps {
  onFranchiseClick: (id: string) => void;
}

function FranchisePage({ onFranchiseClick }: FranchisePageProps) {
  const franchisesMap = useAppSelector(selectFranchises);
  const [searchText, setSearchText] = useState('');

  const filteredFranchises = useMemo(() => {
    const allFranchises = Object.values(franchisesMap);
    
    if (!searchText) return allFranchises;
    
    const searchLower = searchText.toLowerCase();
    return allFranchises.filter(franchise => 
      franchise.title.toLowerCase().includes(searchLower) ||
      franchise.description?.toLowerCase().includes(searchLower)
    );
  }, [franchisesMap, searchText]);

  if (Object.keys(franchisesMap).length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Franchises</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Franchises</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search franchises..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {filteredFranchises.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No franchises found matching your search.</p>
      ) : (
        <FranchiseCardView 
          franchises={filteredFranchises.map(f => ({
            ...f,
            onClick: () => onFranchiseClick(f.id)
          }))} 
        />
      )}
    </div>
  );
}

export default FranchisePage;

