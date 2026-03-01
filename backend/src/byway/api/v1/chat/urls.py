from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.get_conversations, name='conversations'),
    path('start/', views.start_conversation, name='start-chat'),
    path('conversations/<int:conversation_id>/messages/', views.chat_messages, name='chat-messages'),

    path('groups/', views.get_groups, name='get-groups'),
    path('groups/create/', views.create_group, name='create-group'),
    path('groups/<int:group_id>/messages/', views.group_messages, name='group-messages'),
    path('users/search/', views.search_users, name='search-users'),
    path('groups/<int:group_id>/add_members/', views.add_members_to_group, name='group-add-members'),
    path('groups/<int:group_id>/leave/', views.leave_group, name='group-leave'),
    path('groups/<int:group_id>/remove_member/', views.remove_member_from_group, name='group-remove-member'),
]