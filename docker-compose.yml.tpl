version: '3'

services:

  selezioni-lincei:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
      # backend cool-jconon-lincei (in application-lincei.yml, frontend.urls deve contenere l'indirizzo pubblico
      # di questo frontend: link delle mail e ritorno dall'accesso SPID)
      API_URL: "https://selezioni-lincei.test.si.cnr.it"
      # accesso con utenze locali e SPID diretto del backend: niente SSO
      OIDC_ENABLE: "false"
      OIDC_AUTHORITY: ""
      OIDC_REDIRECTURL: ""
      OIDC_CLIENTID: ""
    network_mode: bridge
    labels:
      SERVICE_NAME: ##{SERVICE_NAME}##
    tmpfs:
    - /tmp/