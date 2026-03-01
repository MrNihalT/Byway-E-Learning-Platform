from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_bytes, smart_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import json

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, MyTokenObtainParirSerializer, UserSerializer, 
    UserProfileSerializer, ChangePasswordSerializer, InstructorApplicationSerializer, 
    ResetPasswordEmailRequestSerializer, SetNewPasswordSerializer
)
from accounts.models import User, InstructorApplication, OneTimePassword
from accounts.utils import send_code_to_user

User = get_user_model()

#  AUTHENTICATION 

@api_view(["POST"])
@permission_classes([AllowAny])
def custom_token_obtain_pair(request):

    serializer = MyTokenObtainParirSerializer(data=request.data, context={'request': request})
    try:
        serializer.is_valid(raise_exception=True)
    except Exception as e:
        return Response(e.detail, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.validated_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        

        user.is_active = False 
        user.save()


        try:
            send_code_to_user(user.email)
            return Response({
                'message': 'Registration successful. Check your email for OTP.',
                'email': user.email 
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Error sending email: {str(e)}'}, status=500)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_user_otp(request):
    otp_code = request.data.get('otp')
    try:
        user_otp_obj = OneTimePassword.objects.get(otp=otp_code)
        user = user_otp_obj.user
        
        if not user.is_active:
            user.is_active = True
            user.is_email_verified = True
            user.save()
            user_otp_obj.delete() 
            return Response({'message': 'Account verified successfully!'}, status=200)
        else:
            return Response({'message': 'User already active'}, status=200)
            
    except OneTimePassword.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=400)


# USER PROFILE & PASSWORD 

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PROFILE EMAIL VERIFICATION (Logged In Users)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_otp(request):
    try:
        send_code_to_user(request.user.email)
        return Response({'message': 'OTP sent to your email.'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_profile_otp(request):
    otp_code = request.data.get('otp')
    try:
        user_otp = OneTimePassword.objects.get(user=request.user, otp=otp_code)
        
        request.user.is_email_verified = True
        request.user.save()
        
        user_otp.delete()
        return Response({'message': 'Email verified successfully!'}, status=200)
    except OneTimePassword.DoesNotExist:
        return Response({'error': 'Invalid or expired OTP'}, status=400)


#  INSTRUCTOR & ADMIN 

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser]) 
def get_all_users_admin(request):
    users = User.objects.all().order_by('id')
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_follow_instructor(request, instructor_id):
    instructor = get_object_or_404(User, id=instructor_id)
    student = request.user

    if student == instructor:
        return Response({'error': "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

    if student.following.filter(id=instructor.id).exists():
        student.following.remove(instructor)
        is_following = False
        message = "Unfollowed"
    else:
        student.following.add(instructor)
        is_following = True
        message = "Followed"

    return Response({
        'status': 'success', 
        'message': message, 
        'is_following': is_following,
        'new_follower_count': instructor.followers.count()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_instructor_application(request):
    user = request.user
    
    if user.role == 'instructor':
        return Response({'error': 'You are already an instructor.'}, status=400)
    
    if InstructorApplication.objects.filter(user=user, status='PENDING').exists():
        return Response({'error': 'You already have a pending application.'}, status=400)

    serializer = InstructorApplicationSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(user=user)
        
        user.instructor_status = 'PENDING'
        user.save()
        
        return Response(serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_pending_instructor_applications(request):
    applications = InstructorApplication.objects.filter(status='PENDING').order_by('-created_at')
    serializer = InstructorApplicationSerializer(applications, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def review_instructor_application(request, app_id):
    application = get_object_or_404(InstructorApplication, pk=app_id)
    action = request.data.get('action')
    user = application.user

    if action == 'approve':
        application.status = 'APPROVED'
        application.save()

        user.role = 'instructor'
        user.instructor_status = 'APPROVED'
        
        user.full_name = application.full_name
        user.phone_number = application.phone_number
        user.about_me = application.bio
        user.save()
        
        return Response({'message': 'Application Approved. User is now an Instructor.'})

    elif action == 'reject':
        application.status = 'REJECTED'
        application.save()
        
        user.instructor_status = 'REJECTED'
        user.save()
        
        return Response({'message': 'Application Rejected.'})

    return Response({'error': 'Invalid action'}, status=400)


# PUBLIC & PASSWORD RESET

@api_view(['GET'])
@permission_classes([AllowAny])
def public_user_profile(request, pk):
    user = get_object_or_404(User, pk=pk)
    data = {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
        "about_me": user.about_me,
        "date_joined": user.date_joined,
        "role": user.role
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    serializer = ResetPasswordEmailRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = request.data['email']
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            
            current_site = 'http://localhost:3000' 
            relative_link = f'/reset-password/{uidb64}/{token}'
            absurl = current_site + relative_link
            
            email_body = f'Hello from ByWay,\nUse the link below to reset your password:\n{absurl}'
            
            try:
                send_mail(
                    'Reset your Password',
                    email_body,
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({'error': 'Failed to send email'}, status=500)
                
        return Response({'success': 'If your email exists, we have sent a reset link.'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def set_new_password(request):
    serializer = SetNewPasswordSerializer(data=request.data)
    if serializer.is_valid():
        return Response({'success': True, 'message': 'Password reset success'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)