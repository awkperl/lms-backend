exports.validateLink = (url) => {
  try {
    const parsed = new URL(url);

    // Allowed domains
    const allowed = ["youtube.com", "youtu.be", "drive.google.com"];

    return allowed.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
};