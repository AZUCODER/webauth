'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Check } from 'lucide-react';
import { createUser, updateUser } from '@/actions/admin/userActions';
import { toast } from 'sonner';

type UserFormProps = {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: "USER"| "ADMIN";
  };
};

type FormError = {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
};

export function UserForm({ user }: UserFormProps) {
  const isEditMode = !!user
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    role: user?.role || 'USER'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormError>({})
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [formChanged, setFormChanged] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormChanged(true)
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormError]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as 'USER' | 'ADMIN' }))
    setFormChanged(true)
    
    // Clear role error
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormError = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }
    
    // Name validation (optional but if provided, should be at least 2 chars)
    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    // Password validation (required for new users)
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required for new users'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const formDataObj = new FormData()
      formDataObj.append('email', formData.email)
      formDataObj.append('name', formData.name)
      formDataObj.append('role', formData.role)
      
      // Only append password if provided (required for new users)
      if (formData.password || !isEditMode) {
        formDataObj.append('password', formData.password)
      }
      
      let result
      
      if (isEditMode) {
        result = await updateUser(user.id, formDataObj)
      } else {
        result = await createUser(formDataObj)
      }
      
      if (result.success) {
        toast.success(isEditMode ? 'User info updated' : 'User created')
        setSuccessDialogOpen(true)
      } else {
        toast.error(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Form validation error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (formChanged) {
      setCancelDialogOpen(true)
    } else {
      router.back()
    }
  }

  const confirmCancel = () => {
    setCancelDialogOpen(false)
    router.back()
  }

  const handleSuccessContinue = () => {
    setSuccessDialogOpen(false)
    router.push('/users')
    router.refresh()
  }

  return (
    <>
      <Card className="flex flex-col w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{isEditMode ? "Update User" : "Add new user"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="add email here"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="add username here"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditMode ? "Password (leave blank to keep unchanged)" : "Password"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!isEditMode}
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className={`w-full ${errors.role ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">{errors.role}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={loading}>
              {loading
                ? "Processing..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Discard Changes
            </DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave this page?
              All your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Continue Editing
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              {isEditMode ? "User Updated" : "User Created"} Successfully
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "The user information has been updated successfully."
                : "The new user has been created successfully."}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              variant="default" 
              onClick={handleSuccessContinue}
            >
              Go to Users List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 