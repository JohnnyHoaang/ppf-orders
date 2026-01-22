import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY!;
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_ENDPOINT = process.env.S3_ENDPOINT!;

// Initialize S3 Client
const s3Client = new S3Client({
  region: 'us-east-1', // Supabase S3 compatibility layer often expects 'us-east-1' regardless of actual region
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Needed for Supabase S3 compatibility
});

export async function uploadImage(fileBuffer: Buffer | Uint8Array, fileName: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read', // Ensure the file is public
  });

  try {
    await s3Client.send(command);
    
    // Construct public URL
    // For Supabase, typical pattern: 
    // endpoint/bucket_name/filename 
    // OR native supabase storage URL pattern if we want simpler CDN mainly: 
    // supabase_url/storage/v1/object/public/bucket_name/filename
    
    // We'll use the S3 endpoint derived URL for consistency with the upload method, 
    // but typically for serving, Supabase offers the simpler URL.
    // Let's assume we want the Supabase Storage Public URL format:
    // https://[project].supabase.co/storage/v1/object/public/[bucket]/[key]
    
    // Extract project ID from endpoint if possible, or just build it manually if we knew the base URL.
    // S3_ENDPOINT comes in as: https://project.supabase.co/storage/v1/s3
    // We want: https://project.supabase.co/storage/v1/object/public/bucket/key
    
    const baseUrl = S3_ENDPOINT.replace('/s3', '/object/public');
    return `${baseUrl}/${S3_BUCKET_NAME}/${fileName}`;
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
}

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function deleteImage(fileUrl: string): Promise<void> {
  try {
    // Extract key from URL
    // URL format: .../bucket_name/filename
    // or just assume the last part is the filename if we are at root
    const urlParts = fileUrl.split('/');
    const fileName = urlParts.pop(); // Get last segment
    
    if (!fileName) return;

    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Don't throw, just log. We still want to delete the order even if image delete fails.
  }
}
