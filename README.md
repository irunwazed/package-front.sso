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


## jenis jenis login

login ke SSO portal
```
sso.portal_login()
```

login ke menu
```
sso.portal_login_menu("instansi") // "bkn"|"instansi"|"individu"|"pendukung"
```

login auto redirect kembali
```
sso.portal_login_redirect()
```

