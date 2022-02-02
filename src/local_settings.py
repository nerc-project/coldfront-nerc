import os
import pkgutil

from coldfront.config.settings import *


plugin_openstack = pkgutil.get_loader('coldfront_plugin_openstack.config')
plugin_keycloak_usersearch = pkgutil.get_loader('coldfront_plugin_keycloak_usersearch')

include(plugin_openstack.get_filename())
include(plugin_keycloak_usersearch.get_filename())

ADDITIONAL_USER_SEARCH_CLASSES = ["coldfront_plugin_keycloak_usersearch.search.KeycloakUserSearch"]

# ColdFront upstream ignores the env var even though it exposes the setting.
# https://github.com/ubccr/coldfront/blob/c490acddd2853a39201ebc58d3ba0d2c1eb8f623/coldfront/config/core.py#L80
ACCOUNT_CREATION_TEXT = os.getenv('ACCOUNT_CREATION_TEXT')

SESSION_COOKIE_SAMESITE = ENV.get_value('SESSION_COOKIE_SAMESITE',
                                        default='Lax')

if os.getenv('DEBUG', 'False') == 'True':
    SESSION_COOKIE_SECURE = False

DATABASES = {
    'default': {
        'ENGINE': ENV.get_value(
            'DATABASE_ENGINE',
            default='django.db.backends.mysql'
        ),
        'NAME': ENV.get_value('DATABASE_NAME', default='coldfront'),
        'USER': ENV.get_value('DATABASE_USER'),
        'PASSWORD': ENV.get_value('DATABASE_PASSWORD'),
        'HOST': ENV.get_value('DATABASE_HOST'),
        'PORT': ENV.get_value('DATABASE_PORT', default=3306),
    },
}
