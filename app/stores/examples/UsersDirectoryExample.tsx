/**
 * EXAMPLE COMPONENT: Users Directory
 * 
 * Shows how to:
 * - Fetch users with useFetchUsers
 * - Display paginated/searchable user list from Zustand
 * - Handle filtering without re-fetching
 */

import { useState } from 'react';
import { useFetchUsers } from '@/stores/hooks';
import { useUsersStore } from '@/stores';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export function UsersDirectoryExample() {
  const { users, isLoading, error, refetch } = useFetchUsers();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter locally from Zustand store
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">STP Community</h2>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-sm text-gray-600 mt-2">
          {filteredUsers.length} of {users.length} members
        </p>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="text-center py-8">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            {searchTerm
              ? 'No users match your search'
              : 'No users found'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center gap-3">
                {user.profileImagePath && (
                  <img
                    src={user.profileImagePath}
                    alt={user.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-gray-600">{user.email}</p>
                  {user.authorTitle && (
                    <p className="text-xs text-gray-500">{user.authorTitle}</p>
                  )}
                  {user.companyName && (
                    <p className="text-xs text-gray-500">{user.companyName}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * WHY THIS PATTERN WORKS:
 *
 * 1. Data fetched once: useFetchPosts loads all users into Zustand
 * 2. Filtering is instant: No API calls needed, just filter in-memory
 * 3. No prop drilling: Use store directly whenever needed
 * 4. Single source of truth: All users in Zustand store
 * 5. Automatic updates: If user data changes elsewhere, reflected here
 *
 * ALTERNATIVE: If you need pagination from API:
 * - Pass page/limit to useFetchUsers
 * - Store appends/replaces data based on page
 * - Infinite scroll easy: Just update store with pagination
 */
