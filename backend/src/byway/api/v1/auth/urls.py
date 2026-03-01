from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.v1.auth import views

urlpatterns = [
    # AUTHENTICATION 
    path('token/', views.custom_token_obtain_pair, name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # REGISTRATION 
    path('register/', views.register_user, name='register'),
    path('verify-user-otp/', views.verify_user_otp, name='verify-user-otp'),

    # USER PROFILE
    path('profile/', views.user_profile_view, name='user-profile'),
    path('change-password/', views.change_password_view, name="change-password"),

    # PROFILE EMAIL VERIFICATION (Logged-in Users)
    path('send-otp/', views.send_verification_otp, name='send-otp'),
    path('verify-profile-otp/', views.verify_profile_otp, name='verify-profile-otp'),

    # PASSWORD RESET 
    path('request-reset-email/', views.request_password_reset, name="request-reset-email"),
    path('password-reset-complete/', views.set_new_password, name='password-reset-complete'),

    # INSTRUCTOR & PUBLIC PROFILES 
    path('instructor/follow/<int:instructor_id>/', views.toggle_follow_instructor, name='toggle-follow'),
    path('instructor/apply/', views.submit_instructor_application, name='instructor-apply'),
    path('user/public/<int:pk>/', views.public_user_profile, name='public-user-profile'),
    path('admin/instructor-requests/', views.get_pending_instructor_applications, name='admin_requests'),
    path('admin/instructor-requests/<int:app_id>/review/', views.review_instructor_application, name='admin_review'),

    # ADMIN ROUTES 
    path('admin/all-users/', views.get_all_users_admin, name='admin-all-users'),
    path('admin/instructor-requests/', views.get_pending_instructor_applications, name='admin-instructor-requests'),
    path('admin/instructor-requests/<int:app_id>/review/', views.review_instructor_application, name='admin-review-request'),
]