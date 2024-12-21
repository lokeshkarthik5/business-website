// app/api/deploy/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


export async function POST(req) {
  const { code } = await req.json();
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    const fileName = `portfolio-${Date.now()}/index.html`;

    // Remove ACL parameter and rely on bucket policy instead
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: code,
      ContentType: 'text/html',
      // Remove ACL: 'public-read'
    }));

    // Generate the URL for the hosted website
    const url = `http://${bucketName}.s3-website.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return Response.json({ url });
  } catch (error) {
    console.error('Deployment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}