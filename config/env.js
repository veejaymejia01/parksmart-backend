export const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET']; // PORT is injected by Railway automatically
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

