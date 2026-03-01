from django.contrib import admin
from accounts.models import User, InstructorApplication, OneTimePassword

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'is_email_verified', 'is_staff', 'is_active')
    list_filter = ('role', 'is_email_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'full_name', 'phone_number')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')

@admin.register(InstructorApplication)
class InstructorApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'domain_expertise', 'experience_years', 'status', 'created_at')
    list_filter = ('status', 'gender', 'created_at')
    search_fields = ('full_name', 'user__username', 'user__email', 'phone_number', 'domain_expertise')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'created_at')
    search_fields = ('user__username', 'user__email', 'otp')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)