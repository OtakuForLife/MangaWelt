import { Provider } from 'react-redux'
import { setupStore } from './store'
import { useEffect, useState } from 'react'
import { useAppDispatch } from './hooks/useAppDispatch'
import { fetchProducts } from './store/slices/productSlice'
import { fetchFranchises } from './store/slices/franchiseSlice'
import ExpandableSidebar from './components/ExpandableSidebar'
import BottomTabNavigation from './components/BottomTabNavigation'
import Loading from './components/Loading'
import ErrorBoundary from './components/ErrorBoundary'

// Import pages
import ReleasePage from './pages/ReleasePage';
import BookmarkPage from './pages/BookmarkPage';
import ToBuyPage from './pages/ToBuyPage';
import FranchisePage from './pages/FranchisePage';
import SettingsPage from './pages/SettingsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FranchiseDetailPage from './pages/FranchiseDetailPage';

type ViewType = 'releases' | 'followed' | 'to-buy' | 'franchises' | 'settings' | 'product-detail' | 'franchise-detail'

interface ViewState {
  type: ViewType
  params?: {
    isbn?: string
    id?: string
  }
}

const AppContent = () => {
  const dispatch = useAppDispatch()
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'releases' })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      // Load initial data - continue even if API calls fail
      try {
        await Promise.all([
          dispatch(fetchProducts()),
          dispatch(fetchFranchises())
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
        // Continue anyway - user can configure backend URL in settings
      }
      setIsInitialized(true)
    }
    init()
  }, [dispatch])

  const handleViewChange = (viewId: string) => {
    setCurrentView({ type: viewId as ViewType })
  }

  const handleProductClick = (isbn: string) => {
    setCurrentView({ type: 'product-detail', params: { isbn } })
  }

  const handleFranchiseClick = (id: string) => {
    setCurrentView({ type: 'franchise-detail', params: { id } })
  }

  const handleBackToList = () => {
    setCurrentView({ type: 'releases' })
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  const renderView = () => {
    try {
      switch (currentView.type) {
        case 'releases':
          return <ReleasePage onProductClick={handleProductClick} />
        case 'followed':
          return <BookmarkPage onProductClick={handleProductClick} onFranchiseClick={handleFranchiseClick} />
        case 'to-buy':
          return <ToBuyPage onProductClick={handleProductClick} />
        case 'franchises':
          return <FranchisePage onFranchiseClick={handleFranchiseClick} />
        case 'settings':
          return <SettingsPage />
        case 'product-detail':
          return <ProductDetailPage isbn={currentView.params?.isbn || ''} onBack={handleBackToList} />
        case 'franchise-detail':
          return <FranchiseDetailPage id={currentView.params?.id || ''} onBack={handleBackToList} onProductClick={handleProductClick} />
        default:
          return <ReleasePage onProductClick={handleProductClick} />
      }
    } catch (error) {
      console.error('Error in renderView:', error);
      return <div style={{ padding: '20px', color: 'red' }}>Error rendering view: {String(error)}</div>
    }
  }

  return (
    <ErrorBoundary name="App">
      <div className="flex w-full h-screen bg-white overflow-hidden">
        {/* Desktop: Expandable Sidebar */}
        <ExpandableSidebar
          activeView={currentView.type}
          onViewChange={handleViewChange}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <ErrorBoundary name="MainView">
            {renderView()}
          </ErrorBoundary>
        </main>

        {/* Mobile: Bottom Tab Navigation */}
        <BottomTabNavigation
          activeView={currentView.type}
          onViewChange={handleViewChange}
        />
      </div>
    </ErrorBoundary>
  )
}

function App() {
  const store = setupStore()
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App




