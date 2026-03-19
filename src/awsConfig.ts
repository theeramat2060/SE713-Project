import {S3Client} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
credentials: {
accessKeyId: "3b8b44d3c0d1a2683bbd27f0f4071639",
secretAccessKey:
    //"36d7c05bea269437d67c78e063f93e21944b5d00f04d33abeb0e12791e95ad23"
    "7c4c3fdc59a169aca39cfbdda7b0d24c322dc91958935cb46dd8663b85cd4c31"
},
// Supabase Storage S3-compatible endpoint and region
endpoint: "https://qqoywnidyqyoqjalvcpu.storage.supabase.co/storage/v1/s3",
region: "ap-northeast-1",
forcePathStyle: true


});
export default s3Client;



