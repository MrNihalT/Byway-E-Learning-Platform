import random
from django.core.mail import send_mail
from django.conf import settings
from .models import User, OneTimePassword


def generate_otp():
    return str(random.randint(100000, 999999))

def send_code_to_user(email):
    subject = "One Time Password for Email Verification"
    otp_code = generate_otp()
    user = User.objects.get(email=email)
    
    # Save OTP to database (update if exists, create if not)
    OneTimePassword.objects.update_or_create(
        user=user, 
        defaults={'otp': otp_code}
    )
    
    message = f"Hi {user.username},\n\nPlease use this OTP to verify your account: {otp_code}\n\nThanks,\nByWay Team"
    email_from = settings.EMAIL_HOST_USER
    
    send_mail(subject, message, email_from, [email])