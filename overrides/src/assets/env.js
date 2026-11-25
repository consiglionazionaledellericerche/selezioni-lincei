// Configurazione per lo sviluppo locale (npm start). In produzione il container rigenera questo file da
// env.template.js con le variabili d'ambiente (API_URL, OIDC_*), quindi questi valori non vengono usati.
(function(window) {
    window["env"] = window["env"] || {};

    // backend cool-jconon-lincei in locale
    window["env"]["apiUrl"] = "http://localhost:8081";
    window["env"]["production"] = false;
    window["env"]["oidc.enable"] = "false";
    window["env"]["oidc.authority"] = "";
    window["env"]["oidc.redirectUrl"] = "http://localhost:4200/auth/signin";
    window["env"]["oidc.clientId"] = "selezioni";
  })(this);
