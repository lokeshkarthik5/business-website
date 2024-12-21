import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

export async function deployToS3(htmlCode, bucketName) {
  // Validate inputs
  if (!htmlCode || !bucketName) {
    throw new Error('Missing required parameters: htmlCode or bucketName');
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Check if bucket exists and is accessible
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      console.error('Bucket access error:', error);
      throw new Error(`Cannot access bucket '${bucketName}'. Check if it exists and you have proper permissions.`);
    }

    // Create unique folder name
    const timestamp = new Date().getTime();
    const folderName = `portfolio-${timestamp}`;

    // Upload index.html
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folderName}/index.html`,
      Body: htmlCode,
      ContentType: 'text/html',
      ACL: 'public-read',
    }));

    // Return the URL for the deployed site
    return `http://${bucketName}.s3-website-${process.env.AWS_REGION}.amazonaws.com/${folderName}`;
  } catch (error) {
    console.error('Deployment error:', error);
    throw error;
  }
}