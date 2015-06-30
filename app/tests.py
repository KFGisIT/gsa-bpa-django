from django.core.urlresolvers import resolve
from app.views import Home
import json
from django.http import HttpResponse
from django.test import TestCase


class AppTestCase(TestCase):
    def test_root_url_resolves_to_home_page_view(self):
        found = resolve('/')
        self.assertEqual(found.url_name, 'app.views.Home')
