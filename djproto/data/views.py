import json
import os

from django.conf import settings
from django.http import Http404, HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import render


def save_data(request):
    fpath = request.POST.get('path', None)
    if not fpath:
        raise Http404('Invalid request -- no path in POST')
    # TODO: check that file exists
    with open(os.path.join(settings.DOCUMENT_ROOT, os.path.basename(fpath)), 'a+') as f:
        f.write(request.POST.get('data', None))
    return JsonResponse({
        'msg': 'Success',
    })


def get_plants(request):
    fpath = os.path.join(settings.DOCUMENT_ROOT, 'data', 'plants.txt')
    with open(fpath) as f:
        return HttpResponse(f.read())


def get_objects(request, raw_path=None):
    if not raw_path:
        raw_path = request.POST.get('path')
        # raw_path = 'users.txt'
    if not raw_path:
        raise Http404('Invalid request -- no path in POST')
    fpath = os.path.join(settings.DOCUMENT_ROOT, 'data', raw_path)
    with open(fpath) as f:
        return HttpResponse(f.read())
