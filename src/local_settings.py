import os
import pkgutil

from coldfront.config.settings import *


plugin_openstack = pkgutil.get_loader('coldfront_plugin_openstack.config')
plugin_keycloak_usersearch = pkgutil.get_loader('coldfront_plugin_keycloak_usersearch')

include(plugin_openstack.get_filename())
include(plugin_keycloak_usersearch.get_filename())

ADDITIONAL_USER_SEARCH_CLASSES = ["coldfront_plugin_keycloak_usersearch.search.KeycloakUserSearch"]

if os.getenv('DEBUG', 'False') == 'True':
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'

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
