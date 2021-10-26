# OpenID Connect Configuration

ColdFront supports OpenID Connect via the `mozilla-django-oidc` package and,
optionally, the `mokey_oidc` plugin.

The main difference is that the `mokey_oidc` plugin [syncs up group membership
in addition to creating the user](
https://github.com/ubccr/coldfront/blob/master/coldfront/plugins/mokey_oidc/auth.py)
with the `uid` claim set as the username.

Set the following environment variables
```bash
PLUGIN_AUTH_OIDC="True"
PLUGIN_MOKEY="True"
OIDC_RP_SIGN_ALGO=RS256
OIDC_RP_SCOPES="openid email profile"
OIDC_RP_CLIENT_ID=coldfront
OIDC_RP_CLIENT_SECRET=<client_secret>
OIDC_OP_AUTHORIZATION_ENDPOINT="https://<keycloak_url>/auth/realms/<realm>/protocol/openid-connect/auth"
OIDC_OP_TOKEN_ENDPOINT="https://<keycloak_url>/auth/realms/<realm>/protocol/openid-connect/token"
OIDC_OP_USER_ENDPOINT="https://<keycloak_url>/auth/<realm>/master/protocol/openid-connect/userinfo"
OIDC_OP_JWKS_ENDPOINT="https://<keycloak_url>/auth/<realm>/master/protocol/openid-connect/certs"
```
