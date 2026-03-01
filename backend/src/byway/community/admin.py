from django.contrib import admin
from .models import CommunityPost, PostImage, PollOption, PollVote, Comment, Report

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'post_type', 'title', 'created_at', 'is_comments_disabled')
    list_filter = ('post_type', 'is_comments_disabled', 'created_at')
    search_fields = ('user__username', 'title', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ('post', 'image')
    search_fields = ('post__title', 'post__user__username')

@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ('post', 'text', 'vote_count')
    search_fields = ('post__title', 'text')
    ordering = ('-vote_count',)

@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'poll_option', 'post')
    search_fields = ('user__username', 'poll_option__text', 'post__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__title', 'text')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reason', 'post', 'comment', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('reporter__username', 'description', 'post__title', 'comment__text')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
