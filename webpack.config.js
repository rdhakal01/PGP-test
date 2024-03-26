const path = require('path');
const Dotenv = require('dotenv');

module.exports = {
  // ... other Webpack configurations
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '.env') // Path to your .env file
    })
  ]
};
