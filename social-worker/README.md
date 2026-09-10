# defgodqe social backend

This Worker provides the real cross-device backend for Doom Social.

## Cloudflare setup

From the `social-worker` directory:

```bash
npx wrangler d1 create defgodqe-social
npx wrangler r2 bucket create defgodqe-social-media
```

Put the D1 `database_id` returned by Wrangler into `wrangler.jsonc`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

Then initialize the database:

```bash
npx wrangler d1 execute defgodqe-social --remote --file=./schema.sql
```

Deploy:

```bash
npx wrangler deploy
```

The deployed URL is the value to use as `window.DEFGODQE_SOCIAL_API` in the app.

## Frontend connection

Before the Doom Social module loads, define:

```html
<script>
  window.DEFGODQE_SOCIAL_API = 'https://YOUR-SOCIAL-WORKER.workers.dev';
</script>
```

Do not put API secrets in this variable. The current MVP identifies a browser/device with an opaque generated ID. A production account/login system should replace that identity mechanism before treating it as a security boundary.

## Features

- cross-device public video feed
- R2-backed MP4/WebM/MOV uploads up to 50 MB
- D1 users and creator profiles
- likes and follows
- direct messages
- block and report endpoints
- delete-your-own-video endpoint
- mobile-friendly frontend
