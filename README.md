# Catsalut LookUP

**Catsalut LookUP** és una aplicació web moderna dissenyada per visualitzar, filtrar i cercar unitats proveïdores (UP) del Catàleg de CatSalut de forma àgil i visualment atractiva.

L'aplicació destaca pel seu disseny "Glassmorphism Premium" i la capacitat de processar dades directament del navegador.

## Característiques Principals

- **Càrrega de Dades**: Intenta descarregar automàticament el catàleg oficial. Si hi ha restriccions de xarxa (CORS), permet carregar manualment el fitxer `.zip`.
- **Cerca Instantània**: Filtra per codi, nom de la unitat o entitat proveïdora en temps real.
- **Filtratge per Tipus**: Selector dinàmic per filtrar unitats per la seva tipologia (Hospital, Atenció Primària, etc.).
- **Disseny Premium**: interfície moderna amb fons animats, efectes de vidre (glassmorphism) i tipografia cuidada.
- **Paginació**: Navegació còmoda a través de grans conjunts de dades.

## Com utilitzar-la

1. **Obrir l'aplicació**:
   Simplement obre el fitxer `lookUP.html` amb el teu navegador web preferit (Chrome, Firefox, Edge, Safari). No requereix instal·lació ni servidor web.

2. **Càrrega de dades**:
   - L'aplicació intentarà descarregar les dades automàticament.
   - Si veus un missatge d'error (habitual per restriccions de seguretat dels navegadors), fes clic al botó **"Carregar ZIP"**.
   - Selecciona el fitxer `cataleg-up.zip` que pots descarregar des de la [web de CatSalut](https://catsalut.gencat.cat/web/.content/minisite/catsalut/proveidors_professionals/registres_catalegs/catalegs/territorials-unitats-proveidores/cataleg-up.zip).

## Requisits Tècnics

- Navegador web modern amb suport per JavaScript (ES6+).
- Connexió a internet (per carregar llibreries externes com JSZip i FontAwesome).

## Licencia

Aquest projecte està llicenciat sota la **GNU General Public License v3.0**. Consulta el fitxer `LICENSE` per a més detalls.

---
🄯 2026 Gabriel Reus
