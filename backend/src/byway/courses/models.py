from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

# CORE COURSE MODELS

class Category(models.Model):
    name = models.CharField(max_length=100)
    category_img = models.FileField(upload_to="categoryimage/")
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    
    @property
    def total_course(self):
        return self.courses.count()


class Course(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"

    title = models.CharField(max_length=200)
    short_description = models.CharField(max_length=500)
    description = models.TextField()
    spotlight_image = models.ImageField(upload_to="course_spotlight_background/", blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,validators=[MaxValueValidator(500)],default=1)
    offer_percentage = models.PositiveBigIntegerField(
        default=0, help_text="Discount percentage (e.g., 20 for 20%)"
    )
    course_image = models.ImageField(upload_to="course_images/")
    total_time = models.CharField(max_length=20)
    difficulty = models.CharField(choices=Difficulty.choices, max_length=100)
    
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_taught')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, related_name='courses', null=True)
    
    is_draft = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    certificate_template = models.ImageField(upload_to="certificate_templates/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# CURRICULUM STRUCTURE

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order'] 

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Content(models.Model):
    SECTION_TYPES = (
        ('lecture', 'Lecture'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    )
    section = models.ForeignKey('Section', related_name='contents', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=SECTION_TYPES, default='lecture')
    order = models.IntegerField(default=0)

    video_file = models.FileField(upload_to='course_videos/', null=True, blank=True)
    pdf_file = models.FileField(upload_to='course_pdfs/', null=True, blank=True)
    youtube_url = models.URLField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} ({self.content_type})"


# QUIZ SYSTEM
class Quiz(models.Model):
    content = models.OneToOneField(Content, on_delete=models.CASCADE, related_name='quiz_details')
    pass_mark = models.IntegerField(default=50, help_text="Percentage required to pass")

    def __str__(self):
        return f"Quiz: {self.content.title}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.text


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    passed = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)


class StudentResponse(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    is_correct = models.BooleanField(default=False)


# ASSIGNMENT SYSTEM
class Assignment(models.Model):
    content = models.OneToOneField(Content, on_delete=models.CASCADE, related_name='assignment_details')
    instructions = models.TextField()
    total_marks = models.IntegerField(default=100)
    attachment = models.FileField(upload_to='assignment_resources/', null=True, blank=True)

    def __str__(self):
        return f"Assignment: {self.content.title}"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('graded', 'Graded')
    )
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    submitted_file = models.FileField(upload_to='student_submissions/', null=True, blank=True)
    submitted_text = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    

    marks_obtained = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='submitted', choices=STATUS_CHOICES)


# STUDENT PROGRESS

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"


class LectureCompletion(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lecture_completions")
    lecture = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="completions")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'lecture')


class Review(models.Model):
    course = models.ForeignKey(Course, related_name="reviews", on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reviews", on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f'{self.rating}★ by {self.student.username}'



# E-COMMERCE

class CartItem(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
    
    def __str__(self):
        return f"Cart: {self.course.title}"


class WishlistItem(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"Wishlist: {self.course.title}"


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    )
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="orders")
    merchant_transaction_id = models.CharField(max_length=255, null=True, blank=True)
    phonepe_transaction_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.course.title} - {self.price}"


# Platform reviews 

class PlatformReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)])
    class Meta:
        unique_together = ('user',)
    
    def __str__(self):
        return f"{self.user.username} -> {self.comment}"
    

class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    certificate_id = models.CharField(max_length=50,unique=True)
    issue_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"
    

class Payout(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    )

    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField(help_text="The month this payout is for (e.g., 2023-10-01)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.instructor.username} - {self.amount} - {self.status}"


class Support(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=600)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.subject}"
    
    class Meta:
        verbose_name = "Support"
        verbose_name_plural = "Supports"
