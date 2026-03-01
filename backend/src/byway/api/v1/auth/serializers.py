from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import User , InstructorApplication
from django.contrib.auth.password_validation import validate_password
from courses.models import Enrollment,Review 
from django.db.models import Avg,Count
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    total_customers = serializers.SerializerMethodField()
    total_rating = serializers.SerializerMethodField()

    followers_count = serializers.IntegerField(source='followers.count',read_only=True)

    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id",'username','email','first_name','last_name',
            'about_me','profile_picture',
            'role','is_superuser',
            'qualification','total_customers','total_rating',
            'followers_count','is_following'
        ]
        read_only_fields = ['role', 'id', 'is_superuser', 'total_customers', 'total_rating'] 

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False

    def get_total_customers(self, obj):
        if obj.role != "instructor":
            return 0
        return Enrollment.objects.filter(course__instructor=obj).distinct('student').count()

    def get_total_rating(self, obj):
        if obj.role != 'instructor':
            return 0
        avg_rating = Review.objects.filter(course__instructor=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg_rating, 1) if avg_rating is not None else 0



class MyTokenObtainParirSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except AuthenticationFailed as e:
            raise AuthenticationFailed({
                "status_code":6001,
                "data":"invalid username or password",
                "message":"Login failed"
            })
        
        user_serializer = UserSerializer(self.user, context=self.context)
        
        data['user'] = user_serializer.data

        return {
            'status_code':6000,
            "data":data,
            'message':"Login successfull"
        }
    




class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100,write_only=True)
    password = serializers.CharField(write_only=True,required=True,style={'input_type':'password'})

    class Meta:
        model = User
        fields = ('username','email','password','name','qualification')

    def validate(self,attrs):
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username":"an account with this username already exists."})
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email":"an account with this email already exists."})
            
        return attrs
    
    def create(self,validate_data):
        user = User.objects.create_user(
            username=validate_data['username'],
            email = validate_data['email'],
            password = validate_data['password'],
            first_name = validate_data['name'],
            qualification = validate_data.get('qualification','')
        )
        return user
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 'username', 'email', 'first_name', 'last_name',
            'about_me', 'profile_picture', 'role', 
            'is_email_verified' 
        ]
        read_only_fields = ['role', 'id', 'is_email_verified'] 

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.about_me = validated_data.get('about_me', instance.about_me)

        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)

        instance.save()
        return instance      


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self,value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password is incorrect")
        return value
    
    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "The two password fields didn't match."})
        
        try:
            validate_password(data['new_password1'], self.context['request'].user)
        except serializers.ValidationError as e:
            raise serializers.ValidationError({'new_password1': list(e.messages)})

        return data
            
        
    def save(self,**kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password1'])
        user.save()
        return user




class InstructorApplicationSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    
    certificate_file = serializers.FileField(source='cv_file', read_only=True)
    social_links = serializers.SerializerMethodField()

    class Meta:
        model = InstructorApplication
        fields = [
            'id', 'user', 'username', 'email', 
            'full_name', 'phone_number', 'gender', 'dob',
            'qualification', 'experience_years', 'domain_expertise', 'bio',
            'cv_file', 'certificate_file',
            'linkedin_profile', 'social_links',
            'bank_account_no', 'bank_ifsc_code',
            'status', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'created_at']

    def get_social_links(self, obj):
        return {
            "linkedin": obj.linkedin_profile
        }


class ResetPasswordEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(min_length=2)

    class Meta:
        fields = ['email']


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, max_length=68, write_only=True)
    token = serializers.CharField(min_length=1, write_only=True)
    uidb64 = serializers.CharField(min_length=1, write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')

            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError('The reset link is invalid or expired', 401)

            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError('The reset link is invalid or expired', 401)