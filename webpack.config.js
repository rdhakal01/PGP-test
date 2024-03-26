const path = require('path');
const Dotenv = require('dotenv');

// Securely load environment variables with path adjustments
const dotenv = new Dotenv({
  path: path.resolve(__dirname, '../../../PGP-CSV/.env'),  // Adjust path to .env file
  safe: true
});
dotenv.config();

module.exports = {
  // ... other Webpack configurations

  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '../../../PGP-CSV/.env'), // Use same path here for clarity
      safe: true  // Prevent potential errors from undefined variables
    })
  ],

  // Output path (adjust if needed)
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};

