from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='student')
    full_name = models.CharField(max_length=200, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', default="profile_pics/user.svg")
    about_me = models.TextField(null=True, blank=True)
    qualification = models.CharField(max_length=200, null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    social_links = models.JSONField(default=dict, blank=True) 
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
    @property
    def total_followers(self):
        return self.followers.count()

    def __str__(self):
        return self.username


# INSTRUCTOR APPLICATION MODEL

class InstructorApplication(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instructor_applications')
    
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], default='Male')
    dob = models.DateField(help_text="Date of Birth")
    qualification = models.CharField(max_length=200)
    experience_years = models.IntegerField(default=0)
    domain_expertise = models.CharField(max_length=100, help_text="e.g., Web Development, Data Science")
    bio = models.TextField(help_text="Tell us about yourself")
    
    cv_file = models.FileField(upload_to='instructor_cvs/', blank=True, null=True)

    linkedin_profile = models.URLField(max_length=2000,blank=True, null=True)
    
    bank_account_no = models.CharField(max_length=50)
    bank_ifsc_code = models.CharField(max_length=20)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.status}"


class OneTimePassword(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.otp}"