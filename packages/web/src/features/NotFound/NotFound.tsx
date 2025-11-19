import React from 'react'
import Button from '@/components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
const NotFound: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 select-none transition-colors duration-300">
            404
          </h1>
        </div>
        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold text-headline transition-colors duration-300">
            Page Not Found
          </h2>
          <p className="text-lg text-text transition-colors duration-300">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            leftIcon={<Home className="h-4 w-4" />}
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
export default NotFound
