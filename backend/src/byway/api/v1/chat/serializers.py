from rest_framework import serializers
from chat.models import Conversation, Message, GroupChat, GroupChatMessage
from django.contrib.auth import get_user_model


User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_picture']

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url 
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.ReadOnlyField(source="sender.id")
    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'text', 'created_at', 'is_read']


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'last_message', 'updated_at']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request: return None
        user = request.user
        other = obj.user2 if obj.user1 == user else obj.user1
        return UserSimpleSerializer(other, context=self.context).data

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None



class GroupChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True) 
    
    class Meta:
        model = GroupChatMessage
        fields = ['id', 'sender', 'text', 'created_at']





class GroupChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    

    members = UserSimpleSerializer(source='users', many=True, read_only=True)
    admin_id = serializers.ReadOnlyField(source='admin.id') 
    
    class Meta:
        model = GroupChat
        fields = [
            'id', 
            'name', 
            'description', 
            'updated_at', 
            'last_message', 
            'members',   
            'admin_id'   
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return GroupChatMessageSerializer(last_msg).data
        return None