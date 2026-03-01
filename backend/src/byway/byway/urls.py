import os
import re
import mimetypes
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import StreamingHttpResponse, Http404
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def serve_media_with_range(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404("File not found")

    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'

    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
    
    if range_match:
        first_byte, last_byte = range_match.groups()
        first_byte = int(first_byte) if first_byte else 0
        last_byte = int(last_byte) if last_byte else file_size - 1
        if last_byte >= file_size:
            last_byte = file_size - 1
        length = last_byte - first_byte + 1

        def file_iterator():
            with open(file_path, 'rb') as f:
                f.seek(first_byte)
                remaining = length
                while remaining > 0:
                    data = f.read(min(8192, remaining))
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        response = StreamingHttpResponse(file_iterator(), status=206, content_type=content_type)
        response['Content-Length'] = str(length)
        response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
        return response
    else:
        def file_iterator():
            with open(file_path, 'rb') as f:
                while True:
                    data = f.read(8192)
                    if not data:
                        break
                    yield data
                    
        response = StreamingHttpResponse(file_iterator(), content_type=content_type)
        response['Content-Length'] = str(file_size)
        response['Accept-Ranges'] = 'bytes'
        return response



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include("api.v1.auth.urls")),
    path('api/v1/course/', include("api.v1.courses.urls")),
    path('api/v1/community/', include("api.v1.community.urls")),
    path('api/v1/chat/', include("api.v1.chat.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_with_range),
    ]