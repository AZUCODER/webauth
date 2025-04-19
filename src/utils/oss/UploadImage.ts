"use server"

import { v4 as uuid4 } from 'uuid';
import ossClient from "@/lib/alioss-client";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';


// Upload image to Aliyun OSS
export const uploadImgToCloud = async (formData: FormData) => {
    const file = formData.get('file') as File;

    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type');
    }

    // Validate environment variables
    if (!process.env.OSS_BUCKET_NAME || !process.env.OSS_ENDPOINT) {
        throw new Error('OSS configuration is missing');
    }

    const fileExt = file.name.split('.').slice(-1)[0];
    const newFileName = uuid4() + '.' + fileExt;

    const buffer = await file.arrayBuffer().then(buffer => Buffer.from(buffer));

    await ossClient.put(newFileName, buffer);

    // Construct the URL using environment variables
    const imageUrl = `https://${process.env.OSS_BUCKET_NAME}.${process.env.OSS_ENDPOINT}/${newFileName}`;

    if (!imageUrl.startsWith('https://')) {
        throw new Error('Invalid image URL generated');
    }

    return {
        newFileName,
        fileExt,
        url: imageUrl
    }
}

// Upload image to local storage
export const uploadImgToLocal = async (formData: FormData) => {
    const file = formData.get('file') as File;

    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type');
    }

    const fileExt = file.name.split('.').slice(-1)[0];
    const newFileName = uuid4() + '.' + fileExt;

    // Define upload directory path
    const uploadDir = join(process.cwd(), 'public', 'upload');

    try {
        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });

        // Convert file to buffer
        const buffer = await file.arrayBuffer().then(buffer => Buffer.from(buffer));

        // Save file to local directory
        const filePath = join(uploadDir, newFileName);
        await writeFile(filePath, buffer);

        // Construct the URL relative to public folder
        const imageUrl = `/upload/${newFileName}`;

        return {
            newFileName,
            fileExt,
            url: imageUrl
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload image');
    }
}