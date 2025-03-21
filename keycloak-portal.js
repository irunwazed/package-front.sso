class SSO {
  constructor(config) {
    this.clientId = config.client_id;
    this.realm = config.realm;
    this.url = config.url;
    this.url_portal = config?.url_portal ?? "";
    this.redirectUri = `${window.location.origin}${window.location.pathname}`;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.tokenData = null;
  }

  isTokenValid() {
    return (
      this.token != null &&
      this.tokenExpiry != null &&
      Date.now() < this.tokenExpiry
    );
  }

  getAuthorizationCodeFromHash() {
    const hash = window.location.hash.substring(1); // Remove the "#" symbol
    const params = new URLSearchParams(hash);
    return params.get("code"); // Get the "code" parameter value
  }

  async fetchToken(authorizationCode) {
    const response = await fetch(
      `${this.url}/realms/${this.realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.clientId,
          code: authorizationCode,
          redirect_uri: this.redirectUri,
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch token");
      return;
    }

    const tokenData = await response.json();
    this.tokenData = tokenData;
    this.token = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
  }

  encodeBase64(input) {
    try {
      return btoa(input);
    } catch (err) {
      return input;
    }
  }

  async portal_login_redirect() {
    const isInternal = this.realm == "public-siasn" ? "false" : "true"
    const redirect = window.location.href
    window.location.href = this.url_portal+`?action=login&app=${this.encodeBase64(redirect)}&realm=${this.realm}&client_id=${this.clientId}`
  }

  async portal_login() {
    window.location.href = this.url_portal+`?action=login`
  }

  async init(config) {
    if (config?.silentCheckSsoRedirectUri) {
      // this.redirectSilentUri = config?.silentCheckSsoRedirectUri;
    }

    let code = this.getAuthorizationCodeFromHash();

    if (code) {
      await this.fetchToken(code);
      return this.tokenData;
    }

    if (this.isTokenValid()) {
      return this.tokenData;
    }

    if (this.refreshToken) {
      await this.refreshAccessToken();
      return this.tokenData;
    } else {
      if (config?.silentCheckSsoRedirectUri) {
        // await this.silentLogin();
      } else {
        this.login();
      }
      return this.tokenData;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      console.error("No refresh token available");
      this.login();
      return;
    }

    const response = await fetch(
      `${this.url}/realms/${this.realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.clientId,
          refresh_token: this.refreshToken,
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error("Failed to refresh token");
      this.login();
      return;
    }

    const tokenData = await response.json();
    this.token = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
  }

  login() {
    const authUrl = `${this.url}/realms/${this.realm}/protocol/openid-connect/auth?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_mode=fragment`;
    window.location.href = authUrl;
  }
}

module.exports = SSO;
