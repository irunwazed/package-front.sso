# SSO Keycloak



## Instalasi

### Typescript
```
  import SSO from "./keycloak-portal";
  const sso = new SSO({
    client_id: "",
    realm: "public-siasn",
    url: "https://sso-siasn.bkn.go.id/auth",
    url_portal: "https://asndigital.bkn.go.id/"
  })
 
```


login ke SSO portal
```
sso.portal_login()
```


login ke menu
```
sso.portal_login_menu()
```

login auto redirect kembali
```
sso.portal_login_redirect()
```


### Javascript
```
  <script src="../../keycloak-portal.js"></script>
  <script>
    const sso = new SSO({
    client_id: "",
    realm: "public-siasn",
    url: "https://sso-siasn.bkn.go.id/auth",
    url_portal: "https://asndigital.bkn.go.id/"
  })

  sso.portal_login_redirect()
  </script>
```


