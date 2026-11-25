# Selezioni online – Accademia Nazionale dei Lincei

Frontend Angular di Selezioni online per l'Accademia Nazionale dei Lincei.
Non è un fork: **estende [selezioni-online](https://github.com/consiglionazionaledellericerche/selezioni-online)**
così come il backend [cool-jconon-lincei](https://github.com/consiglionazionaledellericerche/cool-jconon-lincei)
estende cool-jconon. Il repository contiene solo le personalizzazioni; il resto arriva da selezioni-online alla
versione indicata in `upstream.json`.

## Come funziona

Lo script `scripts/overlay.mjs` prepara in `.build/` il sorgente da compilare:

1. copia selezioni-online (clone di `upstream.json`, oppure una cartella locale con `--upstream`);
2. **`overrides/`** – i file con la stessa posizione di selezioni-online vengono sostituiti;
3. **`merge/`** – i file JSON (traduzioni, manifest dell'app) vengono uniti in profondità: si scrivono solo le
   chiavi che cambiano, le altre restano quelle di selezioni-online;
4. **`replace.json`** – sostituzioni puntuali di testo (es. il titolo dell'app in `index.html`).

| Personalizzazione | Dove |
|---|---|
| Configurazione (`src/brand/brand.ts`), ricalcata sul bulkinfo `F_jconon_call_folder` di cool-jconon-lincei: sezioni della gestione del bando con i soli campi dei form `affix_sezione_1`, `_2` e `_3` (`callSectionsFromBulkinfo`), disciplina in "Dettagli Bando", discipline ed età massima in "Dettagli Candidato", filtri della ricerca (disciplina; niente profilo, G.U., inPA, graduatoria), disciplina nelle schede dei bandi, accesso "Entra con SPID" del backend (`spid: true`), HelpDesk disattivato (`helpdesk: false`: niente menu, pagina, link, sezione del bando), piè di pagina e recapiti della pagina Contatti | `overrides/src/brand/brand.ts` |
| Colore primario (#707E2A, che sostituisce anche i blu dell'interfaccia) e intestazione con lo stemma su disco bianco | `overrides/src/brand/_brand.scss`, `_brand-overrides.scss` |
| Logo, favicon, icone dell'app e badge delle notifiche | `overrides/src/assets/images`, `overrides/src/favicon.ico`, `overrides/public/icons` |
| Testi (titolo, home, contatti, accesso, tipologie Premi e Borse, discipline, età massima) | `merge/src/assets/i18n/it.json`, `en.json` |
| Nome e colore dell'app installabile | `merge/public/manifest.webmanifest`, `replace.json` |

Le discipline della domanda si limitano a quelle scelte nel bando senza codice specifico: selezioni-online usa i
valori della proprietà del bando `ns:call_elenco_X` per la proprietà della domanda `ns:application_elenco_X`
(`jconon_lincei_materie:call_elenco_discipline_*` → `application_elenco_discipline_*`), come il frontend legacy.
Il controllo dell'età massima è nel backend (`LinceiApplicationService`); il filtro per disciplina usa il parametro
generico `extraFilters` della ricerca dei bandi (`jconon_call:disciplina~S`, come `criteria-like` del legacy).

## Sviluppo

Con selezioni-online nella cartella accanto (`../selezioni-online`):

```bash
npm start            # overlay dalla copia locale, npm ci e ng serve su http://localhost:4200
```

Per lavorare su una versione pubblicata di selezioni-online: `npm run overlay` (usa `upstream.json`), poi
`npm run install:build` e `cd .build && npx ng serve`.

In sviluppo il frontend usa il backend cool-jconon-lincei su **http://localhost:8081** (`overrides/src/assets/env.js`,
con OIDC disattivato; anche il proxy di `ng serve` punta lì). Per un altro indirizzo:

```bash
API_URL=http://localhost:9090 npm start
```

In produzione `env.js` viene rigenerato all'avvio del container dalle variabili d'ambiente (`API_URL`, `OIDC_*`).

## Build e container

```bash
npm run build                                                   # in .build/dist
docker build -t selezioni-lincei .                              # selezioni-online alla ref di upstream.json
docker build --build-arg SELEZIONI_ONLINE_REF=v1.2.0 -t selezioni-lincei .
docker run -p 8080:80 -e API_URL=https://selezioni.lincei.it -e OIDC_ENABLE=false selezioni-lincei
```

## Aggiornare selezioni-online

Basta cambiare `ref` in `upstream.json` (ramo o tag). Le personalizzazioni restano valide finché selezioni-online
mantiene i punti di estensione di `src/brand/` e i nomi dei file sostituiti; lo script segnala le sostituzioni di
`replace.json` che non trovano più il testo.

## Backend

Serve cool-jconon-lincei con una versione di cool-jconon che comprende le API `/openapi/v1` usate da
selezioni-online e, in `application-lincei.yml`, `frontend.urls` con l'indirizzo di questo frontend: serve per i link
delle mail di registrazione e recupero password e per il ritorno dall'accesso SPID (`/spid/send-response` riporta a
`/auth/spid` di questo frontend solo se l'indirizzo è tra quelli ammessi).
