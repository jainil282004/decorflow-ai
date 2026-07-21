import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../../components/EmptyState';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-[80vh] flex flex-col justify-center max-w-lg mx-auto">
      <ErrorState
        title="404 - Page Not Found"
        message="The page you are looking for doesn't exist or has been moved."
        onRetry={() => navigate('/dashboard')}
      />
    </div>
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="h-[80vh] flex flex-col justify-center max-w-lg mx-auto">
      <ErrorState
        title="403 - Access Denied"
        message="You do not have the required permissions to view this page."
        onRetry={() => navigate('/dashboard')}
      />
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="h-[80vh] flex flex-col justify-center max-w-lg mx-auto">
      <ErrorState
        title="500 - Server Error"
        message="Something went terribly wrong on our end. Please try again later."
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
