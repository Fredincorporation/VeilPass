import React from 'react';

export default function RestrictedPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const required = (searchParams && searchParams.required) || 'authorized role';
  const from = (searchParams && searchParams.from) || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Access Restricted</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          This area requires the <strong>{required}</strong> role. Your account does not have the required
          permissions to access <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded ml-1">{from}</code>.
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact support or request the appropriate role from an
            administrator.
          </p>

          <div className="flex gap-3">
            <a href="/" className="px-4 py-2 bg-cyan-600 text-white rounded">Go to Home</a>
            <a href="/contact" className="px-4 py-2 border rounded">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
