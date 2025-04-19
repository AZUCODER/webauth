'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Pencil, Trash, PlusCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteUser } from '@/actions/admin/userActions';
import { toast } from 'sonner';
import { User } from '@/types/user';

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEditUser = (id: string) => {
    router.push(`/users/edit/${id}`)
  }

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    const result = await deleteUser(userToDelete)
    if (result.success) {
      toast.success('User deleted!')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to delete user')
    }
    
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const getRoleBadge = (role: 'USER' | 'EDITOR'| 'MANAGER'| 'ADMIN') => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">SuperAdmin</Badge>
      case 'MANAGER':
        return <Badge variant="outline" className="bg-purple-100 text-indigo-800">Admin</Badge>
      case 'EDITOR':
  return <Badge variant="outline" className="bg-purple-100 text-orange-800">Editor</Badge>
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">User</Badge>
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">Users Management</h1>
      <p className="text-muted-foreground mb-4 bg-gray-100 p-2 rounded-md">Manage your users here</p>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search email or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => router.push('/users/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="rounded-md border shadow">
        <Table>
          <TableHeader className='bg-gray-100'>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>UserName</TableHead>
              <TableHead>UserRole</TableHead>
              <TableHead>CreatedAt</TableHead>
              <TableHead>UpdatedAt</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No user data available!
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(user.createdAt ?? Date.now()), { addSuffix: true })}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(user.updatedAt ?? Date.now()), { addSuffix: true })}</TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDeleteUser(user.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}