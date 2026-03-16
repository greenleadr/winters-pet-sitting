import LoginForm from '@/components/auth/LoginForm';
import { PawPrintIcon } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 rounded-2xl p-3 mb-3 shadow-lg">
            <PawPrintIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Winter&apos;s</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Pet Sitting &amp; House Cleaning
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Welcome back!</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
