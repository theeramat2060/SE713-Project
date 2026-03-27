import { S3Client } from "@aws-sdk/client-s3";

// Load environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.SUPABASE_ENDPOINT_URL;
const region = process.env.AWS_REGION;

// Validate required environment variables
if (!accessKeyId || !secretAccessKey || !endpoint || !region) {
  throw new Error("Missing required environment variables for AWS S3 configuration. Please check your .env file and ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SUPABASE_ENDPOINT_URL, and AWS_REGION are set.");
}

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  endpoint,
  region,
  forcePathStyle: true,
});

export default s3Client;
