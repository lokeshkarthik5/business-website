import { S3Client,PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function POST(req){

    const {code,folderName} = await req.json();

    const sanitizedFolderName = folderName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

    try {

        const bucketName = process.env.AWS_S3_BUCKET;
        const key = `${sanitizedFolderName}/index.html`;

        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: code,
            ContentType: 'text/html',
            ACL: 'public-read',
          }));

          const url = `http://${bucketName}.s3-website.${process.env.AWS_REGION}.amazonaws.com/${sanitizedFolderName}`;

          return NextResponse.json({url})
        
    } catch (error) {

        return Response.json({ error: error.message }, { status: 500 });
        
    }
}