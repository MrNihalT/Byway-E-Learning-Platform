from django.contrib import admin
from .models import Conversation, Message, GroupChat, GroupChatMessage

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'updated_at')
    search_fields = ('user1__username', 'user2__username')
    ordering = ('-updated_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'conversation', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender__username', 'text')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(GroupChat)
class GroupChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'created_at', 'updated_at', 'last_message_at')
    search_fields = ('name', 'admin__username', 'description')
    ordering = ('-updated_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_message_at')

@admin.register(GroupChatMessage)
class GroupChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'group_chat', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('sender__username', 'group_chat__name', 'text')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
