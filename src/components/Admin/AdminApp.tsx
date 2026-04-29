import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LoginForm } from './LoginForm';
import { ReviewQueue } from './ReviewQueue';

export function AdminApp() {
  const { session, isAdmin, isLoading, signOut } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="admin-shell">
        <div className="admin-shell__loading">Загрузка...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-shell">
        <LoginForm />
      </div>
    );
  }

  if (!isAdmin) {
    // Logged in but not in the admins table — show a clean rejection.
    return (
      <div className="admin-shell">
        <div className="admin-shell__forbidden">
          <h1>Нет доступа</h1>
          <p>Аккаунт {session.user.email} не входит в список администраторов.</p>
          <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-shell__header">
        <div className="admin-shell__title">Модерация отзывов</div>
        <div className="admin-shell__user">
          <span className="admin-shell__email">{session.user.email}</span>
          <a className="admin-shell__home" href="#/">К карте</a>
          <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
            Выйти
          </button>
        </div>
      </header>
      <main className="admin-shell__main">
        <ReviewQueue />
      </main>
    </div>
  );
}
