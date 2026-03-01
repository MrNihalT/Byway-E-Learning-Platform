from django.urls import path
from api.v1.community import views

urlpatterns = [
    # Posts
    path('posts/', views.post_list_create, name='post-list-create'),
    path('posts/<int:pk>/', views.post_detail_action, name='post-detail-action'),
    path('posts/<int:pk>/like/', views.toggle_like, name='toggle-like'),
    
    # Comments
    path('posts/<int:post_pk>/comments/', views.comment_list_create, name='comment-list-create'),
    path('comments/<int:pk>/delete/', views.delete_comment, name='delete-comment'),
    path('posts/<int:post_pk>/comments/<int:comment_pk>/pin/', views.pin_comment, name='pin-comment'),

    # Polls
    path('posts/<int:post_pk>/vote/<int:option_pk>/', views.vote_poll, name='vote-poll'),

    # Reporting
    path('report/', views.report_content, name='report-content'),

    # User Profile - My Posts & Comments
    path('my/posts/', views.my_posts, name='my-posts'),
    path('my/comments/', views.my_comments, name='my-comments'),

    #Admin
    path('admin/reports/', views.admin_reports, name='admin-reports'),
]