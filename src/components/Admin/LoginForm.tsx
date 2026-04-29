import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function LoginForm() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__form" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">Вход в админку</h1>
        <div className="admin-login__field">
          <label className="admin-login__label">Email</label>
          <input
            className="admin-login__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="admin-login__field">
          <label className="admin-login__label">Пароль</label>
          <input
            className="admin-login__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="admin-login__error">{error}</div>}
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
