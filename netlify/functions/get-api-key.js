// functions/get-api-key.js
exports.handler = async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        API_KEY: process.env.GAMER_POWER_API_KEY, // Ensure this matches the environment variable name
      }),
    };
  };