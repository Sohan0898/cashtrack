import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import notFoundAnimation from '../assets/404.json';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Animation Container */}
      <div className="w-full max-w-md md:max-w-lg mb-8">
        <Lottie animationData={notFoundAnimation} loop={true} />
      </div>

      {/* Error Message Card */}
      <div className="card bg-white shadow-xl max-w-md text-center">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl font-bold mb-2 text-gray-900">Oops! Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you mistyped the URL.
          </p>
          <div className="card-actions">
            <Link to="/" className="btn btn-primary gap-2">
              <Home className="w-5 h-5" />
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
