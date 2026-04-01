---
name: deploy-storefront
description: Build storefront JS and deploy theme extension to Shopify
user_invocable: true
---

# Deploy Storefront Extension

Build the storefront TypeScript code and deploy the theme extension to Shopify.

## Steps

1. Build storefront JS:
```bash
cd /home/tuankiet/xipat/shopify-quote-claude/storefront && npm run build
```

2. Deploy to Shopify:
```bash
cd /home/tuankiet/xipat/shopify-quote-claude/storefront && shopify app deploy --force
```

## Notes
- This only deploys the theme extension (blocks, assets, toml) to Shopify
- Backend and frontend are deployed separately via CI/CD Docker
- The `--force` flag skips confirmation prompt
- After deploy, verify the app embed is still enabled in Theme Editor > App embeds
