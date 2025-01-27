const jwt = require('jsonwebtoken');

// Function to generate a token
const generateAuthToken = (userId) => {
  console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  
  // This jwt.sign() method creates a new JWT.
  const token = jwt.sign(
    { id: userId }, // The payload containing the userId
    process.env.JWT_SECRET, // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRES_IN || '1m' } // expiresIn passed as an option
  );

  const decoded = jwt.decode(token);

  // Log the token and expiration time for debugging purposes
  console.log('Token:', token);
  console.log('Expires At:', new Date(decoded.exp * 1000).toISOString());

  // Convert expiration time to milliseconds and return it
  const expirationTimeMillis = decoded.exp * 1000; // Multiply by 1000 to convert to milliseconds
  return { token, exptime: expirationTimeMillis }; // Return the token and expiration time in milliseconds
};

module.exports = generateAuthToken;
