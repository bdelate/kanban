import psycopg2
from.base import *


SECRET_KEY = ')(51baoxi_e87k)3yg365^n4!m85xzhuw%v_d%0z@#jy15t9d^'

ADMIN_URL = 'admin/'

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': '',
        'HOST': 'db',
        'PORT': '',
    }
}

# urls specific to the dev environment, currently only production has specific
# urls, ie: to serve index.html
ENV_URLS = []
