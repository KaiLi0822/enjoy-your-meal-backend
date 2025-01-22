export const config = {
    awsRegion: process.env.AWS_REGION || "ca-central-1",
    table: process.env.TABLE || "RecipesAndMenus",
    bucket: process.env.BUCKET || "recipe-images-enjoyyourmeal",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    accessTokenExpiresIn: 3600, // Short-lived access token
    refreshTokenExpiresInLong: 259200, // Refresh token for "Remember Me", 3600 * 24 * 3
    refreshTokenExpiresInShort: 10800, // Refresh token without "Remember Me" 3600 * 3
    awsCredentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },

  };
  