import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getUsers } from '@/actions/admin/userActions';
import { UserTable } from '@/components/dashboard/tables/UserTable';
import { User } from '@/types/user';



export default async function UsersPage() {
  // Check if user is logged in and is admin
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard')
  }
  
  // Get all users and validate the type
  const result = await getUsers()
  const users: User[] = result.success && Array.isArray(result.user) 
    ? result.user.map(user => ({
        ...user,
        role: user.role as "USER" |"EDITOR"|"MANAGER"| "ADMIN" // Type assertion since we validate roles in the API
      }))
    : [];
  
  return (
    <div className="container mx-auto py-6">
      <UserTable users={users} />
    </div>
  );
}