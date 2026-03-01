from rest_framework import serializers

from django.utils.text import slugify

from api.v1.auth.serializers import UserSerializer
from django.db.models import Avg ,Count
from courses.models import (
    Course, Content, Category, Enrollment, Review, Section,
    LectureCompletion, WishlistItem, CartItem, Order, OrderItem,
    AssignmentSubmission, Assignment, StudentResponse, QuizAttempt,
    Answer, Question, Quiz , PlatformReview , Certificate , Payout , Support
)
from accounts.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'category_img', 'total_course'] 
        read_only_fields = ['total_course', 'slug']

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'name' in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)


# QUIZ

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'answers']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'pass_mark', 'questions']


# ASSIGNMENT

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'instructions', 'total_marks', 'attachment']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'student', 'student_name', 'submitted_file', 'submitted_text', 'submitted_at', 'marks_obtained', 'feedback', 'status']
        read_only_fields = ['student', 'status']


#  CURRICULUM 
class ContentSerializer(serializers.ModelSerializer):
    quiz_details = QuizSerializer(read_only=True)
    assignment_details = AssignmentSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields = [
            'id', 'title', 'description', 'content_type', 'order',
            'video_file', 'pdf_file', 'youtube_url',
            'quiz_details', 'assignment_details', 
            'is_completed'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return LectureCompletion.objects.filter(student=request.user, lecture=obj).exists()


class SectionSerializer(serializers.ModelSerializer):
    contents = ContentSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'contents']


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True) 
    rating = serializers.SerializerMethodField()
    total_review = serializers.SerializerMethodField()
    total_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'short_description', 'price', 'offer_percentage',
            'course_image', 'difficulty', 'total_time', 'instructor', 'category','rating','total_review','total_enrolled'
        ]
    
    def get_rating(self, obj):
        aggregate = obj.reviews.aggregate(Avg('rating'))
        avg_rating = aggregate['rating__avg']
        

        return round(avg_rating, 1) if avg_rating else 0.0

    def get_total_review(self, obj):

        return obj.reviews.count()

    def get_total_enrolled(self, obj):
        return obj.enrollments.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    sections = SectionSerializer(many=True, read_only=True)
    course_image = serializers.ImageField(required=False, allow_null=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'short_description', 'description', 'spotlight_image',
            'price', 'offer_percentage', 'course_image', 'total_time',
            'is_draft', 'difficulty', 'instructor', 'category', 'category_id',
            'sections', 'created_at', 'updated_at', 'is_deleted', 'is_enrolled',
            'certificate_template'
        ]
        read_only_fields = ['instructor']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(course=obj, student=request.user).exists()
        return False


#  COURSE CREATION  

class CourseCreateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        max_length=100, write_only=True, required=False, allow_blank=True 
    )
    category = CategorySerializer(read_only=True)
    instructor = UserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id','title', 'short_description', 'description', 'price',
            'offer_percentage', 'course_image', 'total_time', 'is_draft',
            'difficulty', 'category', 'category_name', 'instructor',
            'certificate_template'
        ]
        read_only_fields = ['instructor', 'category', 'id']

    def create(self, validated_data):
        category_name = validated_data.pop('category_name', None)
        category_instance = None
        
        if category_name and category_name.strip():
            category_instance, created = Category.objects.get_or_create(
                name__iexact=category_name.strip(),
                defaults={
                    'name': category_name.strip(),
                    'slug': slugify(category_name.strip())
                }
            )
        
        course = Course.objects.create(category=category_instance, **validated_data)
        return course


class ContentCreateSerializer(serializers.ModelSerializer):
    section = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Content
        fields = [
            'id', 'title', 'description', 'order', 'content_type',
            'video_file', 'pdf_file', 'youtube_url', 'section' 
        ]
        read_only_fields = ['id', 'section']

    def validate(self, data):
        content_type = data.get('content_type', 'lecture')
        if content_type == 'lecture':
            video = data.get('video_file')
            pdf = data.get('pdf_file')
            youtube = data.get('youtube_url')

            provided_content_count = sum([1 if item else 0 for item in [video, pdf, youtube]])

            if provided_content_count == 0:
                raise serializers.ValidationError("For lectures, you must upload video, PDF, or YouTube URL.")
            
            if provided_content_count > 1:
                raise serializers.ValidationError("Please provide only one content type (Video OR PDF OR YouTube).")
        
        return data


# STUDENT ACTIVITY 
class ReviewSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at', 'student']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True) 
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at']


class CartItemSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'course', 'added_at']


class WishlistItemSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class Meta:
        model = WishlistItem
        fields = ['id', 'course', 'added_at']


class OrderItemSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'course', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'course', 'student', 'merchant_transaction_id', 'phonepe_transaction_id', 'amount', 'status', 'created_at']


# SUBMISSIONS
class StudentResponseSerializer(serializers.ModelSerializer):
    selected_choice_text = serializers.ReadOnlyField(source='selected_choice.text')
    question_text = serializers.ReadOnlyField(source='question.text')

    class Meta:
        model = StudentResponse
        fields = ['id', 'question', 'question_text', 'selected_choice', 'selected_choice_text', 'is_correct']

class QuizAttemptSerializer(serializers.ModelSerializer):
    responses = StudentResponseSerializer(many=True, read_only=True)
    student_name = serializers.ReadOnlyField(source='student.username')
    quiz_title = serializers.ReadOnlyField(source='quiz.content.title')

    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'student_name', 'quiz', 'quiz_title', 'score', 'passed', 'timestamp', 'responses']


class PlatformReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    user_role = serializers.ReadOnlyField(source='user.role')
    user_image = serializers.SerializerMethodField()

    class Meta:
        model = PlatformReview
        fields = ['id', 'user_name', 'user_role', 'user_image', 'rating', 'comment', 'created_at']

    def get_user_image(self, obj):
        try:
            if obj.user.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.user.profile_picture.url)
                return obj.user.profile_picture.url
        except Exception:
            return None
        return None                


class CategoryWithCoursesSerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'category_img', 'slug', 'courses']
    
    def get_courses(self,obj):
        qs = Course.objects.filter(category=obj,is_draft=False,is_deleted=False).annotate(
            total_enrollments=Count('enrollments')
        ).order_by('-total_enrollments')[:4]

        return CourseSerializer(qs, many=True, context=self.context).data


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    course_image = serializers.ImageField(source='course.course_image', read_only=True)
    instructor = serializers.ReadOnlyField(source='course.instructor.username')

    class Meta:
        model = Certificate
        fields = ['id', 'certificate_id', 'issue_date', 'course', 'course_title', 'course_image', 'instructor']



class InstructorBankDetailsSerializer(serializers.ModelSerializer):
    bank_account_no = serializers.SerializerMethodField()
    bank_ifsc_code = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'bank_account_no', 'bank_ifsc_code']

    def get_bank_account_no(self, obj):
        app = obj.instructor_applications.filter(status='APPROVED').last()
        return app.bank_account_no if app else "N/A"

    def get_bank_ifsc_code(self, obj):
        app = obj.instructor_applications.filter(status='APPROVED').last()
        return app.bank_ifsc_code if app else "N/A"


class PayoutSerializer(serializers.ModelSerializer):
    instructor = InstructorBankDetailsSerializer(read_only=True)
    
    class Meta:
        model = Payout
        fields = ['id', 'instructor', 'amount', 'month', 'status', 'created_at']



class SupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Support
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']

