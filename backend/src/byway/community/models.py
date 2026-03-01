from django.db import models
from django.conf import settings


class CommunityPost(models.Model):
    POST_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('poll', 'Poll'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default='text')
    title = models.CharField(max_length=200, blank=True) 
    description = models.TextField(blank=True)
    video = models.FileField(upload_to='community_videos/', null=True, blank=True)
    
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="liked_posts", blank=True)
    is_comments_disabled = models.BooleanField(default=False)
    pinned_comment = models.OneToOneField('Comment', on_delete=models.SET_NULL, null=True, blank=True, related_name='pinned_on')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.post_type} - {self.created_at}"

    @property
    def total_likes(self):
        return self.likes.count()


class PostImage(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='community_images/')


# community
class PollOption(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='poll_options')
    text = models.CharField(max_length=200)

    image = models.ImageField(upload_to='poll_images/', null=True, blank=True) 
    vote_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.text


class PollVote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    poll_option = models.ForeignKey(PollOption, on_delete=models.CASCADE)
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE) 

    class Meta:
        unique_together = ('user', 'post') 


class Comment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    def __str__(self):
        return f"Comment by {self.user.username}"


class Report(models.Model):
    REPORT_TYPES = (
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
    )
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(CommunityPost, null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE)
    reason = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)