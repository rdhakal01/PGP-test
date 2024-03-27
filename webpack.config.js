const path = require('path');
const Dotenv = require('dotenv-webpack');

// This function will attempt to load environment variables from the .env file
// located in the PGP-CSV repository. If successful, it returns a Dotenv plugin
// configured to use those environment variables. Otherwise, it returns null.
function loadDotenvPlugin() {
  try {
    // Attempt to require dotenv and load the .env file
    const dotenvPath = path.resolve(__dirname, '../../PGP-CSV/.env');
    require('dotenv').config({ path: dotenvPath });

    // If dotenv loaded successfully, return the Dotenv plugin
    return new Dotenv({ path: dotenvPath });
  } catch (error) {
    // If dotenv failed to load (e.g., .env file not found), return null
    console.error('Failed to load environment variables from .env file:', error);
    return null;
  }
}

module.exports = {
  // Other webpack configurations...

  plugins: [
    // Attempt to load environment variables from .env file
    loadDotenvPlugin(),

    // Other plugins...
  ],

  // Output path (adjust if needed)
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
