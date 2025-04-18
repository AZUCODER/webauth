'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session/manager';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { UserSchema } from '@/types/user';



// Return type for all user actions
export type UserActionReturn = {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    name: string | null
    role: string
    createdAt?: Date
    updatedAt?: Date
    emailVerified?: Date | null
  } | Array<{
    id: string
    email: string
    name: string | null
    role: string
    createdAt?: Date
    updatedAt?: Date
    emailVerified?: Date | null
  }>
}

// Get all users
export async function getUsers(): Promise<UserActionReturn> {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, user: users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<UserActionReturn> {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'failed to fetch uer info' }
  }
}

// Create new user
export async function createUser(formData: FormData): Promise<UserActionReturn> {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    const email = formData.get('email') as string
    const name = formData.get('username') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as Role

    // Validate input data
    const validatedData = UserSchema.parse({
      email,
      name,
      password,
      role
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return { success: false, error: 'Email already taken' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password as string, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    revalidatePath('/users')

    return { success: true, user: newUser }
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      }
    }
    return { success: false, error: 'Failed to create user.' }
  }
}

// Update user
export async function updateUser(id: string, formData: FormData): Promise<UserActionReturn> {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' }
    }

    const email = formData.get('email') as string
    const name = formData.get('username') as string
    const password = formData.get('password') as string || undefined
    const role = formData.get('role') as Role

    // Validate input data, excluding password if not provided
    const dataToValidate: z.infer<typeof UserSchema> = {
      email,
      name,
      role
    }
    
    if (password) {
      dataToValidate.password = password
    }
    
    const validatedData = UserSchema.parse(dataToValidate)

    // Check if email is already taken by another user
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: validatedData.email,
          NOT: { id }
        }
      })

      if (existingUser) {
        return { success: false, error: 'The email is taken' }
      }
    }

    // Prepare data for update
    const updateData: {
      email: string;
      name?: string | null;
      role: Role;
      password?: string;
    } = {
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    revalidatePath('/users')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      }
    }
    return { success: false, error: 'Failed to update user' }
  }
}

// Delete user
export async function deleteUser(id: string): Promise<UserActionReturn> {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
} 