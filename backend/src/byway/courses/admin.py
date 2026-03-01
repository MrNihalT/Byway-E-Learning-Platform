from django.contrib import admin
from .models import (
    Course, Category, Content, Enrollment, CartItem, LectureCompletion, 
    Order, Review, Section, Certificate, Quiz, Question, Answer, QuizAttempt, 
    StudentResponse, Assignment, AssignmentSubmission, WishlistItem, 
    OrderItem, PlatformReview, Payout, Support
)
from accounts.models import User

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'price', 'difficulty', 'is_draft', 'is_deleted', 'certificate_template')
    list_filter = ('is_draft', 'is_deleted', 'difficulty', 'category', 'instructor')
    search_fields = ('title', 'instructor__username', 'short_description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "instructor":
            kwargs["queryset"] = User.objects.filter(role='instructor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    ordering = ('course', 'order')

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'content_type', 'order')
    list_filter = ('content_type', 'section__course')
    search_fields = ('title', 'section__title', 'description')
    ordering = ('section', 'order')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('content', 'pass_mark')
    search_fields = ('content__title',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'text', 'order')
    list_filter = ('quiz',)
    search_fields = ('text', 'quiz__content__title')
    ordering = ('quiz', 'order')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'text', 'is_correct')
    list_filter = ('is_correct', 'question__quiz')
    search_fields = ('text', 'question__text')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'passed', 'timestamp')
    list_filter = ('passed', 'timestamp', 'quiz')
    search_fields = ('student__username', 'quiz__content__title')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)

@admin.register(StudentResponse)
class StudentResponseAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('attempt__student__username', 'question__text')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('content', 'total_marks')
    search_fields = ('content__title', 'instructions')

@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'status', 'marks_obtained', 'submitted_at')
    list_filter = ('status', 'submitted_at')
    search_fields = ('student__username', 'assignment__content__title')
    ordering = ('-submitted_at',)
    readonly_fields = ('submitted_at',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')
    list_filter = ('enrolled_at', 'course')
    search_fields = ('student__username', 'course__title')
    ordering = ('-enrolled_at',)
    readonly_fields = ('enrolled_at',)

@admin.register(LectureCompletion)
class LectureCompletionAdmin(admin.ModelAdmin):
    list_display = ('student', 'lecture', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('student__username', 'lecture__title')
    ordering = ('-completed_at',)
    readonly_fields = ('completed_at',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'course')
    search_fields = ('student__username', 'course__title', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('student__username', 'course__title')
    ordering = ('-added_at',)
    readonly_fields = ('added_at',)

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('student__username', 'course__title')
    ordering = ('-added_at',)
    readonly_fields = ('added_at',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student__username', 'merchant_transaction_id', 'phonepe_transaction_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'course', 'price')
    search_fields = ('order__id', 'course__title')

@admin.register(PlatformReview)
class PlatformReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'certificate_id', 'issue_date')
    list_filter = ('issue_date', 'course')
    search_fields = ('student__username', 'course__title', 'certificate_id')
    ordering = ('-issue_date',)
    readonly_fields = ('issue_date',)

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ('instructor', 'amount', 'month', 'status', 'created_at')
    list_filter = ('status', 'month', 'created_at')
    search_fields = ('instructor__username', 'transaction_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'paid_at')

@admin.register(Support)
class SupportAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)

