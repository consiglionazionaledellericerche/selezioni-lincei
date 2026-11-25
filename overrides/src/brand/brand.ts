import { Brand } from './brand.model';

/**
 * Configurazione di Selezioni online dell'Accademia Nazionale dei Lincei
 * (sostituisce src/brand/brand.ts di selezioni-online). Ricalca il bulkinfo F_jconon_call_folder di
 * cool-jconon-lincei: form affix_sezione_1 e affix_sezione_3, filtri "all-filters" e colonne della ricerca.
 */
export const BRAND: Brand = {
  // l'HelpDesk non è gestito per l'Accademia: niente menu, pagina, link, sezione del bando e testi relativi
  helpdesk: false,
  // "Entra con SPID" come nel legacy: accesso SAML del backend (cool-jconon-spid), Identity Provider da /spid/list
  spid: true,
  callExtraForms: {
    // disciplina del bando (Scientifiche, Umanistiche, Scientifiche/Umanistiche)
    detail: 'affix_sezione_1',
    // discipline umanistiche/scientifiche ed età massima
    aspirant: 'affix_sezione_3'
  },
  // le sezioni della gestione del bando mostrano solo i campi dei form affix_sezione_1, _2 e _3 del bulkinfo
  // (es. niente profilo, tipo selezione e sede prescelta; nessuna sezione CNR, curriculum o prodotti)
  callSectionsFromBulkinfo: true,
  search: {
    hidden: ['profile', 'gazzetteNumber', 'newGazzetteNumber', 'dallaDataInPA', 'dallaDataGraduatoria'],
    extraFilters: [{
      name: 'disciplina',
      label: 'label.jconon_call_disciplina',
      property: 'jconon_call:disciplina',
      operator: 'like',
      options: [
        { value: 'S', label: 'label.jconon_call_disciplina.DS' },
        { value: 'M', label: 'label.jconon_call_disciplina.DM' }
      ]
    }]
  },
  callCardFields: [
    { property: 'jconon_call:disciplina', label: 'label.jconon_call_disciplina', valueLabelPrefix: 'label.jconon_call_disciplina.' }
  ],
  footer: {
    organization: 'Accademia Nazionale dei Lincei',
    address: 'Palazzo Corsini - Via della Lungara, 10 - 00165 Roma',
    contactLinks: [
      { label: 'Segreteria generale', url: 'mailto:segreteria@lincei.it' },
      { label: 'Posta Elettronica Certificata', url: 'mailto:accademianazionaledeilincei@postecert.it' }
    ],
    siteLinks: [{ label: 'Sito dell\'Accademia', url: 'https://www.lincei.it/' }],
    socials: [],
    logoUrl: 'https://www.lincei.it/',
    logoAlt: 'Accademia Nazionale dei Lincei'
  },
  contacts: {
    address: 'Palazzo Corsini - Via della Lungara, 10 - 00165 Roma',
    phones: ['+39 06 680271'],
    emails: ['segreteria@lincei.it'],
    pec: ['accademianazionaledeilincei@postecert.it'],
    fax: ['+39 06 6893616']
  }
};
