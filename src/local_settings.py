import os
import pkgutil

from coldfront.config.settings import *


plugin_openstack = pkgutil.get_loader('coldfront_plugin_openstack.config')

include(plugin_openstack.get_filename())

if os.getenv('DEBUG', 'False') == 'True':
    SESSION_COOKIE_SECURE = False
