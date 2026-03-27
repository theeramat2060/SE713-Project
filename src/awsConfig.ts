import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // Supabase Storage S3-compatible endpoint and region
  endpoint: process.env.AWS_S3_ENDPOINT || "https://qqoywnidyqyoqjalvcpu.storage.supabase.co/storage/v1/s3",
  region: process.env.AWS_REGION || "ap-northeast-1",
  forcePathStyle: true,
});

export default s3Client;



