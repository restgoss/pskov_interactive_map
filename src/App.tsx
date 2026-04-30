import { useEffect, useState } from 'react';
import { MapView } from '@/components/Map/MapView';
import { MapSettings } from '@/components/Map/MapSettings';
// import { AttractionsButton } from '@/components/Map/AttractionsButton';
import { DistrictPanel } from '@/components/DistrictPanel';
import { AttractionCard } from '@/components/AttractionCard';
import { AppLoader } from '@/components/AppLoader';
import { AdminApp } from '@/components/Admin/AdminApp';
import { useApplyTheme } from '@/hooks/useTheme';

// Tiny hash-based router. `#/admin` shows the moderation UI, anything else
// shows the public map. We avoid pulling in react-router for one route.
function isAdminRoute(): boolean {
  return window.location.hash.startsWith('#/admin');
}

export function App() {
  useApplyTheme();
  const [adminRoute, setAdminRoute] = useState(isAdminRoute);

  useEffect(() => {
    const onHashChange = () => setAdminRoute(isAdminRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (adminRoute) return <AdminApp />;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <div className="app__title">Интерактивная карта Псковской области</div>
          <div className="app__subtitle">Районы, достопримечательности и отзывы</div>
        </div>
      </header>

      <MapView />
      <MapSettings />
      {/* <AttractionsButton /> */}
      <DistrictPanel />
      <AttractionCard />
      <AppLoader />
    </div>
  );
}
