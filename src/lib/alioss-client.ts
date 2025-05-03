// Mock version of the Ali-OSS client to avoid build issues
// This is a placeholder that mimics the OSS interface without requiring the actual dependency

// Define a mock OSS client interface
const ossClient = {
  put: async (fileName: string, buffer: Buffer) => {
    console.log(`[MOCK OSS] Would upload file ${fileName} (${buffer.length} bytes)`);
    // In a real environment, this would actually upload to OSS
    // For now, return a mock response
    return {
      name: fileName,
      url: `https://example.oss.com/${fileName}`,
      res: {
        status: 200,
        statusCode: 200,
        headers: {},
        size: buffer.length,
      }
    };
  },
  // Add other methods as needed
  get: async (fileName: string) => {
    console.log(`[MOCK OSS] Would download file ${fileName}`);
    return { content: Buffer.from('mock content') };
  },
  delete: async (fileName: string) => {
    console.log(`[MOCK OSS] Would delete file ${fileName}`);
    return { res: { status: 204 } };
  }
};

export default ossClient;