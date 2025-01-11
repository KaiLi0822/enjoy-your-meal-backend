export const config = {
    awsRegion: process.env.AWS_REGION || "us-east-1",
    recipesTable: process.env.RECIPES_TABLE || "Recipes",
    usersTable: process.env.USERS_TABLE || "Users",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    accessTokenExpiresIn: "1h", // Short-lived access token
    refreshTokenExpiresInLong: "3d", // Refresh token for "Remember Me"
    refreshTokenExpiresInShort: "1h", // Refresh token without "Remember Me"
    awsCredentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  };
  