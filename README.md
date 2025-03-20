# SSO Keycloak



## Instalasi

### typescript
```
  import SSO from "./keycloak-portal";
  const sso = new SSO({
    client_id: "",
    realm: "public-siasn",
    url: "https://sso-siasn.bkn.go.id/auth",
    url_portal: "https://asndigital.bkn.go.id/"
  })
  sso.portal_login()
```

### Javascript

