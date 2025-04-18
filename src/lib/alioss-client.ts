import OSS from 'ali-oss';

// Validate environment variables
if (!process.env.OSS_BUCKET_NAME ||
    !process.env.OSS_ACCESS_KEY_ID ||
    !process.env.OSS_ACCESS_KEY_SECRET) {
    throw new Error('OSS configuration is missing');
}
// You'll need to configure the OSS client with your credentials
const ossClient = new OSS({
    region: 'oss-cn-chengdu',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET_NAME,
});

export default ossClient