import s3Client from '../awsConfig';
import {PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from 'crypto';

function generateSaltedFilename(originalName: string): string {
    const salt = randomBytes(16).toString('hex');
    const extension = originalName.split('.').pop();
    return `${salt}.${extension}`;
}


export async function uploadFile(bucket: string, filePath: string, file: Express.Multer.File): Promise<string> {
    console.log('=== Upload File Debug Info ===')
    console.log('Bucket:', bucket);
    console.log('FilePath:', filePath);
    console.log('File Name:', file.originalname);
    console.log('File Size:', file.size);
    console.log('File MIME Type:', file.mimetype);
    
    const saltedFilename = generateSaltedFilename(file.originalname);
    const saltedFilePath = `${filePath}/${saltedFilename}`;
    const params = {
        Bucket: bucket,
        Key: saltedFilePath,
        Body: file.buffer,
        ContentType: file.mimetype
    };



    console.log('S3 Params:', JSON.stringify({...params, Body: '[Buffer]'}));

    try {
        console.log('Sending PutObjectCommand to S3...');
        const data = await s3Client.send(new PutObjectCommand(params));
        console.log('File uploaded successfully:', data);
        return saltedFilePath;
        


    } catch (error: any) {
        console.error('Error uploading file:', error);
        console.error('Error Code:', error.Code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', JSON.stringify(error, null, 2));
        throw error;
    }
}

export async function getPresignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: filePath
    });
    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
}

