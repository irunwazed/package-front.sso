export interface SSOConfig {
  client_id: string;
  realm: string;
  url: string;
  url_portal?: string;
}


class SSO {
  private clientId: string;
  private realm: string;
  private url: string;
  private url_portal: string;
  private redirectUri: string;
  // private redirectSilentUri: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private tokenData: any;

  constructor(config: SSOConfig) {
    this.clientId = config.client_id;
    this.realm = config.realm;
    this.url = config.url;
    this.url_portal = config?.url_portal ?? "";
    this.redirectUri = `${window.location.origin}${window.location.pathname}`;
    // this.redirectSilentUri = `${window.location.origin}/silent-check-sso.html`; // Redirect URI untuk silent login
  }

  private isTokenValid(): boolean {
    return (
      this.token != null &&
      this.tokenExpiry != null &&
      Date.now() < this.tokenExpiry
    );
  }

  // private getAuthorizationCode(url: string): string | null {
  //   const urlParams = new URL(url).searchParams;
  //   return urlParams.get("code");
  // }

  private getAuthorizationCodeFromHash(): string | null {
    const hash = window.location.hash.substring(1); // Menghapus simbol #
    const params = new URLSearchParams(hash);
    return params.get("code"); // Mengambil nilai dari parameter code
  }

  // Fungsi silent login dengan fallback
  // private async silentLogin(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const authUrl = `${this.url}/realms/${this.realm}/protocol/openid-connect/auth?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectSilentUri)}&prompt=none`;

  //     const iframe = document.createElement("iframe");
  //     iframe.src = authUrl;
  //     iframe.style.display = "none";
  //     document.body.appendChild(iframe);

  //     const handleMessage = async (event: MessageEvent) => {
  //       if (event.origin === window.location.origin) {
  //         window.removeEventListener("message", handleMessage);
  //         document.body.removeChild(iframe);

  //         const urlParams = new URLSearchParams(event.data); // Parse data as URL parameters
  //         const code = urlParams.get("code");

  //         if (code) {
  //           await this.fetchToken(code);
  //           resolve();
  //         } else if (event.data.includes("error=login_required")) {
  //           console.warn("Silent login failed, login required");
  //           this.login(); // Redirect to login page if silent login fails
  //           reject("Silent login failed, redirecting to login");
  //         } else {
  //           reject("Authorization code not found in silent login response.");
  //         }
  //       }
  //     };

  //     window.addEventListener("message", handleMessage);
  //   });
  // }

  private async fetchToken(authorizationCode: string): Promise<void> {
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
      // this.login();
      return;
    }

    const tokenData = await response.json();
    this.tokenData = tokenData;
    this.token = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
  }

  private encodeBase64 = (input: string): string => {
    try{
      return btoa(input);
    }catch(err){}
    return input
  };
  
  // private decodeBase64 = (input: string): string => {
  //   try{
  //     return atob(input);
  //   }catch(err){}
  //   return input
  // };

  public async portal_login_redirect() {
    const isInternal = this.realm == "public-siasn" ? "false" : "true"
    const redirect = window.location.href
    window.location.href = this.url_portal+`?action=login&app=${this.encodeBase64(redirect)}&isInternal=${isInternal}`
  }


  public async portal_login() {
    window.location.href = this.url_portal+`?action=login`
  }

  public async init(
    config: any | undefined
  ): Promise<any> {
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

  private async refreshAccessToken(): Promise<void> {
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

  public login(): void {
    const authUrl = `${this.url}/realms/${this.realm}/protocol/openid-connect/auth?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_mode=fragment`;
    window.location.href = authUrl;
  }
}

export default SSO;
