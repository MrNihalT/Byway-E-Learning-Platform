from rest_framework import serializers
from community.models import CommunityPost, PostImage, PollOption, PollVote, Comment, Report


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    user_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    is_pinned = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'user_avatar', 'text', 'created_at', 'parent', 'replies', 'is_pinned']
        read_only_fields = ['user', 'created_at', 'replies']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None

    def get_replies(self, obj):
        if obj.replies.exists():
            return self.__class__(obj.replies.all(), many=True, context=self.context).data
        return []

    def get_is_pinned(self, obj):
        return obj.post.pinned_comment == obj


class PollOptionSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = ['id', 'text', 'image', 'vote_count', 'percentage'] 

    def get_percentage(self, obj):
        total_votes = PollVote.objects.filter(post=obj.post).count()
        if total_votes == 0: return 0
        return round((obj.vote_count / total_votes) * 100, 1)


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']


class CommunityPostSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.full_name")
    user_avatar = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    total_likes = serializers.ReadOnlyField()
    
    
    images = PostImageSerializer(many=True, read_only=True)
    poll_options = PollOptionSerializer(many=True, read_only=True)
    
    
    user_voted_option = serializers.SerializerMethodField()

    
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )
    poll_options_data = serializers.ListField(
        child=serializers.CharField(max_length=200),
        write_only=True, required=False
    )

    class Meta:
        model = CommunityPost
        fields = [
            'id', 'user', 'user_name', 'user_avatar', 'post_type',
            'title', 'description', 'video', 'images', 
            'uploaded_images', 'poll_options', 'poll_options_data', 
            'user_voted_option', 'created_at', 'total_likes', 'is_liked', 
            'is_comments_disabled'
        ]
        read_only_fields = ['user', 'created_at', 'likes']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False

    def get_user_voted_option(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.post_type == 'poll':
            vote = PollVote.objects.filter(post=obj, user=request.user).first()
            if vote:
                return vote.poll_option.id
        return None


    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        poll_options_texts = validated_data.pop('poll_options_data', [])
        
        request = self.context.get('request')
        
        post = CommunityPost.objects.create(**validated_data)

        
        if uploaded_images: 
            for img in uploaded_images:
                PostImage.objects.create(post=post, image=img)
        
        if post.post_type == 'poll':
            for index, text in enumerate(poll_options_texts):

                image_key = f'poll_image_{index}'
                image_file = request.FILES.get(image_key)
                
               
                PollOption.objects.create(post=post, text=text, image=image_file)

        return post

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['reason', 'description', 'post', 'comment']