from django.db import models
from django.conf import settings
from django.db.models import Q


class Conversation(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='user1_conversations')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='user2_conversations')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} - {self.user2}"



class Message(models.Model):
    conversation = models.ForeignKey(Conversation,on_delete=models.CASCADE,related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} - {self.text}"




class GroupChat(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='group_chats')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True) 
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_group_chats')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
   
    last_message_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class GroupChatMessage(models.Model):
    group_chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    

    read_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='read_group_messages', blank=True)

    def __str__(self):
        return f"{self.sender} - {self.text[:20]}"



