# Environments

Filled in by the `project-setup` skill, then edited by hand. Variable **names** only, never values.

| | UAT | PROD |
| --- | --- | --- |
| URL | {{UAT_URL}} | {{PROD_URL}} |
| Hosting | {{UAT_HOSTING}} | {{PROD_HOSTING}} |
| Auth | {{UAT_AUTH}} | {{PROD_AUTH}} |
| Database | {{UAT_DB}} | {{PROD_DB}} |
| Other services | {{UAT_SERVICES}} | {{PROD_SERVICES}} |
| Who deploys | Agent may deploy (via CI) | Human only |

## Environment variables

| Name | What it is for | Where it is set |
| --- | --- | --- |
| {{VAR_NAME}} | {{PURPOSE}} | {{WHERE}} |

## Deploy flow

{{DEPLOY_FLOW}}

<!-- Example:
PR merged to main → CI deploys to UAT → human checks UAT → human promotes to PROD.
-->

## Test accounts (UAT)

Where the UAT test accounts and roles are documented (never the passwords themselves): {{TEST_ACCOUNTS_LOCATION}}
