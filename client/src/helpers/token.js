export const normalizeToken = (rawToken) => {
  if (!rawToken) {
    return null;
  }

  if (typeof rawToken !== "string") {
    if (typeof rawToken.token === "string") {
      return rawToken.token;
    }

    try {
      return String(rawToken);
    } catch (error) {
      console.error("Cannot normalise token:", error);
      return null;
    }
  }

  const trimmed = rawToken.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      console.error("Cannot parse token string:", error);
      return trimmed.replace(/^['"]|['"]$/g, "");
    }
  }

  return trimmed;
};

export const decodeTokenPayload = (rawToken) => {
  try {
    const token = normalizeToken(rawToken);
    if (!token || typeof token !== "string") {
      return null;
    }

    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Cannot decode token:", error);
    return null;
  }
};