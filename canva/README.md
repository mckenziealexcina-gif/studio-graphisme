# Connecter Canva — comment me donner l'accès API

⚠️ **Je ne peux pas me connecter avec juste ton email + mot de passe.** L'API Canva
(« Connect API ») marche en OAuth : tu crées une *intégration*, tu récupères 2 clés,
tu les mets dans un fichier local, et tu autorises une fois dans ton navigateur.
Après ça je peux téléverser tes affiches dans ton Canva. ~5 minutes.

## Ce que ça permet (et pas)
- ✅ **Pousser** une affiche rendue ici → dans ta bibliothèque Canva (uploads), voire créer un design Canva à partir de l'image.
- ✅ **Exporter** un design que TU as fait dans Canva → PNG/PDF pour le retravailler ici.
- ❌ Ça ne transforme pas mon HTML en design Canva 100% éditable (couches/texte). Canva a son propre format : l'image arrive comme visuel, pas comme calques modifiables.

> Concrètement : on continue de **créer** les affiches ici (contrôle total, illimité), et Canva sert de **bibliothèque / point de partage / planif**. C'est le meilleur des deux.

---

## Étapes (5 min)

**1. Crée ton intégration Canva**
- Va sur **https://www.canva.com/developers/** → connecte-toi (mckenziealexcina@gmail.com) → **Your integrations** → **Create an integration**.
- Type : *Public* ou *Private* (Private suffit, c'est pour ton usage).
- Donne un nom (ex. « Studio Graphisme »).

**2. Configure-la**
- **Scopes / Permissions**, coche au minimum :
  `asset:read`, `asset:write`, `design:content:read`, `design:content:write`, `design:meta:read`, `profile:read`.
- **Redirect URL** (Authentication) : ajoute **exactement**
  ```
  http://127.0.0.1:3001/callback
  ```
  > Canva exige l'IP `127.0.0.1` (pas `localhost`) **avec le port**.
- **Récupère tes 2 clés** : *Client ID* et *Client Secret* (génère le secret, copie-le tout de suite).

**3. Donne-moi les clés — SANS les coller dans le chat**
```bash
cp canva/.env.example canva/.env
```
Puis ouvre `canva/.env` et colle :
```
CANVA_CLIENT_ID=xxxxxxxx
CANVA_CLIENT_SECRET=xxxxxxxx
CANVA_REDIRECT_URI=http://127.0.0.1:3001/callback
```
> `canva/.env` est git-ignoré, il ne part nulle part. Évite de coller le *secret* directement dans la conversation.
> Tu peux aussi juste me dire « c'est rempli » et je m'occupe du reste.

**4. Autorise (une fois)**
```bash
node canva/connect.mjs login
```
→ ton navigateur s'ouvre sur Canva → clique **Allow**. Le token est stocké dans
`canva/.canva-token.json` (git-ignoré) et se rafraîchit tout seul ensuite.

Vérifier : `node canva/connect.mjs status`

**5. Pousse une affiche**
```bash
# juste l'image dans ta bibliothèque Canva :
node canva/push.mjs output/vape-societe-promo.png --title "Promo été — Vape Société"

# + créer un design Canva éditable à partir de l'image :
node canva/push.mjs output/vape-societe-promo.png --title "Promo été" --design
```

---

## En résumé, « me donner l'API » = 
1. créer l'intégration sur canva.com/developers, 2. coller *Client ID* + *Client Secret* dans `canva/.env`,
3. lancer `node canva/connect.mjs login` et cliquer **Allow**. C'est tout.

*Note : certains endpoints avancés (Autofill de brand templates) demandent Canva Enterprise. L'upload d'asset, la création de design et l'export marchent sur un compte standard/Pro.*
