// Set defaults so Railway starts even if Variables UI has not been configured
process.env.MONGO_URI = process.env.MONGO_URI ||
  'mongodb+srv://apppersonaltesting_db_user:DbML1Y1cLa9a8gWt@cluster0.afczuvj.mongodb.net/parksmart?authSource=admin&retryWrites=true&w=majority';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'parksmart_jwt_secret_key_2026';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

export const validateEnv = () => {
  console.log('✅ Environment configured (using built-in defaults if not overridden)');
};
