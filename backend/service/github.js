import axios from 'axios';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/**
 * Exchange GitHub OAuth code for an access token.
 */
export async function getGitHubAccessToken(code) {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: 'application/json' },
    }
  );

  return response.data.access_token;
}

/**
 * Get GitHub user profile using access token.
 */
export async function getGitHubUser(accessToken) {
  const response = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * Get primary verified email of GitHub user (used if `email` is not returned directly).
 */
export async function getGitHubPrimaryEmail(accessToken) {
  const response = await axios.get('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const primaryEmail = response.data.find(email => email.primary && email.verified);
  return primaryEmail?.email || null;
}
