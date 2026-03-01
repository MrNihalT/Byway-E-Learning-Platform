import json
import os
import random
import uuid
import razorpay
import logging
import io
from decimal import Decimal
from datetime import datetime , timedelta
from dateutil.relativedelta import relativedelta

from django.utils import timezone
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count , Sum , F
from django.utils.timezone import now
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from courses.models import (
    Course, Content, Category, Enrollment, Review, Section,
    LectureCompletion, WishlistItem, CartItem, Order, OrderItem,
    Quiz, Question, Answer, QuizAttempt, StudentResponse,
    Assignment, AssignmentSubmission , PlatformReview,Certificate , Payout, Support
)
from accounts.models import User
from dateutil.relativedelta import relativedelta
from .serializers import (
    CourseSerializer as CourseListSerializer,
    CategorySerializer,
    CourseCreateSerializer,
    CourseDetailSerializer,
    ContentCreateSerializer,
    EnrollmentSerializer,
    UserSerializer,
    ReviewSerializer,
    ContentSerializer,
    SectionSerializer,
    CartItemSerializer,
    WishlistItemSerializer,
    OrderSerializer,
    QuizAttemptSerializer, 
    AssignmentSubmissionSerializer,
    StudentResponseSerializer,
    PlatformReviewSerializer,
    CategoryWithCoursesSerializer,
    CertificateSerializer,
    PayoutSerializer,
    SupportSerializer
)


User = get_user_model()

# PAGINATION
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 1000

# RAZORPAY CLIENT
try:
    RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
    RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    print("✅ Razorpay Client Initialized Successfully!")
except Exception as e:
    print(f"❌ Razorpay Client Initialization Failed: {e}")
    razorpay_client = None


# PUBLIC VIEWS

from django.db.models import Q

@api_view(["GET"])
@permission_classes([AllowAny])
def course_list(request):
    courses = Course.objects.filter(is_draft=False, is_deleted=False)
    category_id = request.query_params.get('category_id')

    if category_id:
        courses = courses.filter(category__id=category_id)

    search_query = request.query_params.get('search')

    if search_query:
        courses = courses.filter(title__icontains=search_query)

    difficulty = request.query_params.get('difficulty')
    if difficulty:
        courses = courses.filter(difficulty__iexact=difficulty)

    price_filter = request.query_params.get('price_type')

    if price_filter == 'low_to_high':
        courses = courses.annotate(total_enrollments=Count('enrollments')).order_by('price')
    elif price_filter == 'high_to_low':
        courses = courses.annotate(total_enrollments=Count('enrollments')).order_by('-price')
    else:
        courses = courses.annotate(total_enrollments=Count('enrollments')).order_by('-total_enrollments')
    
    paginator = StandardResultsSetPagination()
    paginator.page_size = request.query_params.get('limit', 50) 

    result_page = paginator.paginate_queryset(courses, request)

    if result_page is not None:
        serializer = CourseListSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
def home_page_courses(request):
    category_ids = list(
        Category.objects.filter(courses__isnull=False).distinct().values_list('id', flat=True)
    )
    selected_ids = random.sample(category_ids, min(5, len(category_ids)))
    categories = Category.objects.filter(id__in=selected_ids)
    serializer = CategoryWithCoursesSerializer(categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk, is_draft=False, is_deleted=False)
    serializer = CourseDetailSerializer(course, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def seller_list(request):
    instructors = User.objects.filter(role="instructor").annotate(
        student_count = Count('courses_taught__enrollments')
    ).order_by('-student_count')
    
    paginator = StandardResultsSetPagination()
    paginator.page_size = request.query_params.get('limit', 50)
    
    result_page = paginator.paginate_queryset(instructors, request)
    if result_page is not None:
        serializer = UserSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
        
    serializer = UserSerializer(instructors, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_instructor_courses(request,pk):
    instructor = get_object_or_404(User,id=pk)
    courses = Course.objects.filter(instructor=instructor,is_draft=False,is_deleted=False).order_by('-created_at')
    serializer = CourseListSerializer(courses,many=True,context={'request':request})
    return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_public_stats(request):
    try:
        stats = {
            'total_courses': Course.objects.filter(is_draft=False, is_deleted=False).count(),
            'total_students': User.objects.filter(role="student").count(),
            'total_instructors': User.objects.filter(role='instructor').count(),
            'total_enrollments': Enrollment.objects.count()
        }
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def category_detail(request, pk):
    category = get_object_or_404(Category, pk=pk)
    serializer = CategorySerializer(category, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def course_review_list(request, pk):
    reviews = Review.objects.filter(course__id=pk).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True, context={'request': request})
    return Response(serializer.data)


# INSTRUCTOR MANAGEMENT

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_course(request):
    if request.user.role != "instructor":
        return Response({'error': "Permission denied"}, status=403)
    
    serializer = CourseCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        course = serializer.save(instructor=request.user)
        response_serializer = CourseDetailSerializer(course, context={'request': request})
        return Response(response_serializer.data, status=201)
    return Response({"status_code": 6001, "data": str(serializer.errors)}, status=400)


@api_view(['PUT', 'DELETE', 'GET'])
@permission_classes([IsAuthenticated])
def edit_course(request, pk):
    try:
        if request.user.is_superuser:
            course = get_object_or_404(Course, id=pk)
        elif request.user.role == "instructor":
            course = get_object_or_404(Course, id=pk, instructor=request.user)
        else:
            return Response({'Error': 'Unauthorized Access'}, status=403)
    except Course.DoesNotExist:
        return Response({'error': "Course not found"}, status=404)

    if request.method == 'GET':
        serializer = CourseDetailSerializer(course, context={'request': request})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = CourseDetailSerializer(course, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"status_code": 6001, "data": str(serializer.errors)}, status=400)
    elif request.method == "DELETE":
        course.is_deleted = True
        course.save()
        return Response(status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_my_courses(request):
    if request.user.role != "instructor":
        return Response({'error': 'Permission denied'}, status=403)
    courses = Course.objects.filter(instructor=request.user, is_deleted=False).order_by('-created_at')
    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_dashboard_stats(request):
    user = request.user
    if user.role != "instructor":
        return Response({'error': 'Permission denied'}, status=403)
    
    total_earnings = OrderItem.objects.filter(
        course__instructor=user,
        order__status='SUCCESS'
    ).aggregate(total=Sum('price'))['total'] or 0

    total_students = Enrollment.objects.filter(course__instructor=user).count()

    courses = Course.objects.filter(instructor=user)
    course_stats = []

    for course in courses:
        earnings = OrderItem.objects.filter(
            course=course,
            order__status='SUCCESS'
        ).aggregate(total=Sum('price'))['total'] or 0
        
        sales_count = course.enrollments.count()

        course_stats.append({
            'title': course.title,
            'sales_count': sales_count,
            'revenue': earnings,
            'current_price': course.price
        })

    course_stats.sort(key=lambda x: x['revenue'], reverse=True)

    best_selling_course = course_stats[0] if course_stats else None

    return Response({
        'total_earnings': total_earnings,
        'total_students': total_students,
        'best_selling_course': best_selling_course,
        'course_breakdown': course_stats
    })



# CURRICULUM MANAGEMENT

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_section_to_course(request, course_pk):
    course = get_object_or_404(Course, pk=course_pk)
    if request.user != course.instructor:
        return Response({'error': 'Permission denied'}, status=403)
    serializer = SectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_content_to_section(request, section_pk):
    section = get_object_or_404(Section, pk=section_pk)
    if request.user != section.course.instructor:
        return Response({'error': 'Permission denied'}, status=403)

    content_type = request.data.get('content_type', 'lecture')
    title = request.data.get('title')
    order = request.data.get('order', 0)

    # QUIZ
    if content_type == 'quiz':
        try:
            questions_data = json.loads(request.data.get('questions')) 
        except (TypeError, json.JSONDecodeError):
            return Response({'error': 'Invalid questions format'}, status=400)

        content = Content.objects.create(section=section, title=title, content_type='quiz', order=order)
        quiz = Quiz.objects.create(content=content, pass_mark=request.data.get('pass_mark', 50))

        for q in questions_data:
            question = Question.objects.create(quiz=quiz, text=q['text'])
            for ans in q['answers']:
                Answer.objects.create(
                    question=question, 
                    text=ans['text'], 
                    is_correct=ans.get('is_correct', False)
                )
        return Response(ContentSerializer(content).data, status=201)

    # ASSIGNMENT
    elif content_type == 'assignment':
        content = Content.objects.create(section=section, title=title, content_type='assignment', order=order)
        Assignment.objects.create(
            content=content,
            instructions=request.data.get('instructions'),
            total_marks=request.data.get('total_marks', 100),
            attachment=request.FILES.get('attachment')
        )
        return Response(ContentSerializer(content).data, status=201)

    # LECTURE
    elif content_type == 'lecture':
        serializer = ContentCreateSerializer(data=request.data)
        if serializer.is_valid():
            content = serializer.save(section=section, content_type='lecture')
            return Response(ContentSerializer(content).data, status=201)
        return Response(serializer.errors, status=400)

    return Response({'error': 'Invalid type'}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated]) 
def delete_section(request, pk):
    section = get_object_or_404(Section, pk=pk)
    if request.user != section.course.instructor:
        return Response({'error': 'Permission denied'}, status=403)
    section.delete()
    return Response(status=204)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_content(request, pk):
    content = get_object_or_404(Content, pk=pk)
    if request.user != content.section.course.instructor:
        return Response({'error': 'Permission denied'}, status=403)
    content.delete()
    return Response(status=204)


# INSTRUCTOR GRADING

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instructor_pending_work(request):
    if request.user.role != 'instructor':
        return Response({'error': 'Denied'}, status=403)

    pending_assignments = AssignmentSubmission.objects.filter(
        assignment__content__section__course__instructor=request.user,
        status='submitted'
    ).select_related('student', 'assignment__content')
    
    assign_data = []
    for sub in pending_assignments:
        assign_data.append({
            'type': 'assignment',
            'id': sub.id,
            'student_name': sub.student.username,
            'course_title': sub.assignment.content.section.course.title,
            'assignment_title': sub.assignment.content.title,
            'instructions': sub.assignment.instructions,
            'instructor_file': sub.assignment.attachment.url if sub.assignment.attachment else None,
            'file_url': sub.submitted_file.url if sub.submitted_file else None,
            'text_submission': sub.submitted_text,
            'total_marks': sub.assignment.total_marks,
            'submitted_at': sub.submitted_at
        })

    return Response({'pending_assignments': assign_data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_assignment(request, submission_pk):
    submission = get_object_or_404(AssignmentSubmission, pk=submission_pk)
    if request.user != submission.assignment.content.section.course.instructor:
        return Response({'error': 'Denied'}, status=403)

    marks = request.data.get('marks')
    if marks is None: return Response({'error': 'Marks required'}, status=400)

    submission.marks_obtained = marks
    submission.feedback = request.data.get('feedback', '')
    submission.status = 'graded'
    submission.save()

    return Response({'message': 'Graded successfully'})


# STUDENT LEARNING

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_enrolled_courses(request):
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    courses = [e.course for e in enrollments]
    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lecture_complete(request, lecture_pk):
    lecture = get_object_or_404(Content, pk=lecture_pk)
    course = lecture.section.course
    
    is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    is_instructor = (request.user == course.instructor)

    if not is_enrolled and not is_instructor:
        return Response({'error': 'Not enrolled'}, status=403)
    if lecture.content_type == 'quiz':
        has_passed = QuizAttempt.objects.filter(
            student=request.user,
            quiz__content=lecture,
            passed=True
        ).exists()

        if not has_passed:
            return Response(
                {'error': 'You must score 75% or higher on the quiz to complete this item.'}, 
                status=400
            )


    _, created = LectureCompletion.objects.get_or_create(student=request.user, lecture=lecture)
    return Response({'message': 'Lecture completed.'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_detail_view(request, pk): 
    lecture = get_object_or_404(Content, pk=pk) 
    course = lecture.section.course
    user = request.user
    
    is_allowed = user.is_superuser or (user == course.instructor) or Enrollment.objects.filter(student=user, course=course).exists()
    if not is_allowed:
        return Response({'error': 'Permission denied'}, status=403)
    
    serializer = ContentSerializer(lecture, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_pk): 
    try:
        quiz = get_object_or_404(Quiz, pk=quiz_pk)
        user_answers = request.data.get('answers', {})
        
        if not isinstance(user_answers, dict):
            return Response({'error': 'Invalid data format.'}, status=400)

        total_questions = quiz.questions.count()
        correct_count = 0

        attempt = QuizAttempt.objects.create(student=request.user, quiz=quiz, score=0, passed=False)


        for q_id, a_id in user_answers.items():
            if not a_id: continue
            try:
                question = Question.objects.get(id=q_id, quiz=quiz)
                selected_answer = Answer.objects.get(id=a_id, question=question)
                is_correct = selected_answer.is_correct
                if is_correct: correct_count += 1

                StudentResponse.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_choice=selected_answer,
                    is_correct=is_correct
                )
            except (ValueError, TypeError, Question.DoesNotExist, Answer.DoesNotExist):
                continue

        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        
        PASS_MARK = 75 
        passed = score >= PASS_MARK

        attempt.score = score
        attempt.passed = passed
        attempt.save()

        if passed:
            LectureCompletion.objects.get_or_create(student=request.user, lecture=quiz.content)

        return Response({
            'score': score, 
            'passed': passed, 
            'correct': correct_count, 
            'total': total_questions,
            'required_score': PASS_MARK
        }, status=200)

    except Exception as e:
        return Response({'error': f"Server Error: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request, assignment_pk):
    assignment = get_object_or_404(Assignment, pk=assignment_pk)
    if AssignmentSubmission.objects.filter(student=request.user, assignment=assignment).exists():
        return Response({'error': 'Already submitted'}, status=400)

    AssignmentSubmission.objects.create(
        assignment=assignment,
        student=request.user,
        submitted_text=request.data.get('submitted_text'),
        submitted_file=request.FILES.get('submitted_file')
    )
    LectureCompletion.objects.get_or_create(student=request.user, lecture=assignment.content)
    return Response({'message': 'Submitted'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_list(request):
    submissions = AssignmentSubmission.objects.filter(student=request.user).order_by('-submitted_at')
    
    data = []
    for sub in submissions:
        data.append({
            'id': sub.id,
            'course_title': sub.assignment.content.section.course.title,
            'assignment_title': sub.assignment.content.title,
            'status': sub.status,
            'marks_obtained': sub.marks_obtained,
            'total_marks': sub.assignment.total_marks,
            'feedback': sub.feedback,
            'submitted_at': sub.submitted_at,
            'submitted_text': sub.submitted_text,
            'submitted_file': sub.submitted_file.url if sub.submitted_file else None
        })
    return Response(data)


@api_view(['PUT','POST'])
@permission_classes([IsAuthenticated])
def create_course_review(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if not Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'error': 'Not enrolled'}, status=400)
    
    rating = request.data.get('rating')
    comment = request.data.get('comment')

    if request.method == "PUT":
        review = get_object_or_404(Review, student=request.user, course=course)
        review.rating = rating
        review.comment = comment
        review.save()
        return Response(ReviewSerializer(review).data)

    elif request.method == "POST":
        if Review.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already reviewed'}, status=400)
        review = Review.objects.create(student=request.user, course=course, rating=rating, comment=comment)
        return Response(ReviewSerializer(review).data, status=201)


# E-COMMERCE

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    if request.method == "GET":
        cart_items = CartItem.objects.filter(student=request.user).order_by('-added_at')
        serializer = CartItemSerializer(cart_items, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        course_id = request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        CartItem.objects.get_or_create(student=request.user, course=course)
        return Response({'message': 'Added to cart'}, status=201)
    elif request.method == "DELETE":
        CartItem.objects.filter(student=request.user).delete()
        return Response(status=204)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    CartItem.objects.filter(student=request.user, course=course).delete()
    return Response(status=204)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    if request.method == "GET":
        items = WishlistItem.objects.filter(student=request.user)
        return Response(WishlistItemSerializer(items, many=True, context={'request': request}).data)
    elif request.method == "POST":
        course_id = request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        WishlistItem.objects.get_or_create(student=request.user, course=course)
        return Response({'message': 'Added to wishlist'}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    WishlistItem.objects.filter(student=request.user, course=course).delete()
    return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    if not razorpay_client: return Response({'error': "Payment config error"}, status=500)
    
    course_id = request.data.get('course_id')
    course = get_object_or_404(Course, id=course_id)
    
    final_price = float(course.price) * (1 - (course.offer_percentage / 100))
    amount_in_paise = int(round(final_price * 100))

    try:
        rp_order = razorpay_client.order.create({
            'amount': amount_in_paise, 'currency': 'INR', 'payment_capture': 1
        })
        
        order = Order.objects.create(
            student=request.user,
            merchant_transaction_id=rp_order['id'],
            amount=final_price,
            status='PENDING'
        )
        OrderItem.objects.create(order=order, course=course, price=final_price)
        
        return Response({
            'order_id': rp_order['id'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'amount': amount_in_paise,
            'course_title': course.title
        }, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_razorpay_payment(request):
    if not razorpay_client: return Response({'error': 'Payment config error'}, status=500)
    
    data = request.data
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        })
        
        order = Order.objects.get(merchant_transaction_id=data.get('razorpay_order_id'), student=request.user)
        order.status = 'SUCCESS'
        order.phonepe_transaction_id = data.get('razorpay_payment_id')
        order.save()
        
        for item in order.items.all():
            Enrollment.objects.get_or_create(student=request.user, course=item.course)
            
        CartItem.objects.filter(student=request.user).delete()
        
        return Response({'status': 'success'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_cart(request):
    if not razorpay_client: return Response({'error': "Payment config error"}, status=500)
    
    cart_items = CartItem.objects.filter(student=request.user)
    if not cart_items.exists(): return Response({'error': 'Cart empty'}, status=400)

    total_amount = 0
    for item in cart_items:
        price = float(item.course.price) * (1 - (item.course.offer_percentage / 100))
        total_amount += price

    try:
        rp_order = razorpay_client.order.create({
            'amount': int(round(total_amount * 100)), 'currency': 'INR', 'payment_capture': 1
        })
        
        order = Order.objects.create(
            student=request.user,
            merchant_transaction_id=rp_order['id'],
            amount=total_amount,
            status='PENDING'
        )
        
        for item in cart_items:
            price = float(item.course.price) * (1 - (item.course.offer_percentage / 100))
            OrderItem.objects.create(order=order, course=item.course, price=price)
            
        return Response({
            'order_id': rp_order['id'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'amount': int(round(total_amount * 100)),
            'description': 'Cart Checkout'
        }, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)




# ADMIN VIEWS

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_admin_stats(request):
    total_users = User.objects.count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    total_instructors = User.objects.filter(role='instructor').count()

    total_revenue = Order.objects.filter(status='SUCCESS').aggregate(
        total=Sum('amount')
    )['total'] or 0

    instructors = User.objects.filter(role='instructor')
    instructor_performance = []

    for instr in instructors:
        instr_earnings = OrderItem.objects.filter(
            course__instructor=instr,
            order__status='SUCCESS'
        ).aggregate(total=Sum('price'))['total'] or 0

        instr_sales_count = Enrollment.objects.filter(
            course__instructor=instr
        ).count()

        courses_created = Course.objects.filter(instructor=instr).count()

        instructor_performance.append({
            'id': instr.id,
            'name': instr.username,
            'email': instr.email,
            'courses_created': courses_created,
            'total_students_taught': instr_sales_count,
            'total_revenue_generated': instr_earnings
        })

    instructor_performance.sort(key=lambda x: x['total_revenue_generated'], reverse=True)

    return Response({
        'platform_stats': {
            'total_users': total_users,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_instructors': total_instructors,
            'total_revenue': total_revenue
        },
        'instructor_stats': instructor_performance
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_all_courses_admin(request):
    courses = Course.objects.all().order_by('-created_at')
    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_create_category(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_edit_category(request, pk):
    cat = get_object_or_404(Category, pk=pk)
    serializer = CategorySerializer(cat, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)




# PLATFORM REVIEWS

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_platform_review(request):
    user = request.user

    if user.role == 'student':
        has_purchased = Enrollment.objects.filter(student=user).exists()
        if not has_purchased:
            return Response({'error': 'You must purchase a course to leave a review'}, status=status.HTTP_403_FORBIDDEN)
    
    elif user.role == "instructor":
        has_sales = Enrollment.objects.filter(course__instructor=user).exists()
        if not has_sales:
            return Response(
                {'error': 'You must sell at least one course to leave a review.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    if PlatformReview.objects.filter(user=user).exists():
        serializer = PlatformReviewSerializer(PlatformReview.objects.get(user=user), data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    serializer = PlatformReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_platform_reviews(request):
    reviews = PlatformReview.objects.all().order_by('rating')
    serializer = PlatformReviewSerializer(reviews, many=True, context={'request': request})
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_certificate(request, pk):
    course = get_object_or_404(Course, pk=pk)
    user = request.user

    if not Enrollment.objects.filter(student=user, course=course).exists():
        return Response({'error': 'You are not enrolled in this course.'}, status=403)

    total_lectures = Content.objects.filter(section__course=course).count()
    
    completed_lectures = LectureCompletion.objects.filter(
        student=user, 
        lecture__section__course=course
    ).values('lecture').distinct().count()

    if total_lectures == 0:
         return Response({'error': 'Course has no content.'}, status=400)

    if completed_lectures < total_lectures:
        missing = total_lectures - completed_lectures
        return Response({
            'error': f'You have {missing} incomplete items. Quizzes must be PASSED to count.'
        }, status=400)

    cert, created = Certificate.objects.get_or_create(
        student=user, 
        course=course,
        defaults={'certificate_id': uuid.uuid4().hex[:10].upper()}
    )

    buffer = io.BytesIO()
    
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # BACKGROUND / BORDER LOGIC
    template_path = None
    if course.certificate_template:
        template_path = course.certificate_template.path
    elif hasattr(settings, 'DEFAULT_CERTIFICATE_TEMPLATE') and os.path.exists(settings.DEFAULT_CERTIFICATE_TEMPLATE):
        template_path = settings.DEFAULT_CERTIFICATE_TEMPLATE

    if template_path:
        try:
            # Register Carlito font if exists
            font_path = os.path.join(settings.MEDIA_ROOT, 'fonts', 'Carlito-Bold.ttf')
            font_name = "Helvetica-Bold" # Default fallback
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('Carlito-Bold', font_path))
                    font_name = 'Carlito-Bold'
                except Exception as e:
                    print(f"DEBUG: Error registering Carlito font: {e}")

            # Use uploaded Canva/Template as the full background
            c.drawImage(template_path, 0, 0, width=width, height=height)
            
            # User's requested color: #e3cc84 (A nice Gold/Yellow)
            cert_color = colors.HexColor("#e3cc84")
            c.setFillColor(cert_color)

            # STUDENT NAME (Centered)
            c.setFont(font_name, 40)
            student_name = f"{user.first_name} {user.last_name}".strip() or user.username
            c.drawCentredString(width / 2, (height / 2) + 0.35*inch, student_name)
            
            # COURSE NAME (Overlayed below the student name)
            c.setFont(font_name, 24)
            c.drawCentredString(width / 2, (height / 2) - 0.47*inch, course.title)

            # FOOTER DETAILS (Using the gold color for consistency)
            # User wants 20px (20pt) for Instructor, Date, and ID
            c.setFont(font_name.replace('-Bold', ''), 20) if '-Bold' in font_name else c.setFont(font_name, 20)
            instructor_name = f"{course.instructor.full_name or course.instructor.username}"
            c.drawString(2.0*inch, 1.26*inch, f"{instructor_name}") 
            
            formatted_date = cert.issue_date.strftime('%B %d, %Y')
            c.drawString(width - 3.7*inch, 1.26*inch, f"{formatted_date}") 
            
            # Verification ID at the extreme bottom (margin bottom 2px)
            c.setFont(font_name.replace('-Bold', ''), 14) if '-Bold' in font_name else c.setFont(font_name, 20)
            c.drawCentredString(width / 2, 43, f"Verification ID: {cert.certificate_id}")

        except Exception as e:
            print(f"DEBUG: Error loading certificate template: {e}")
            template_path = None # Trigger fallback below




    if not template_path:
        # DEFAULT SYSTEM DESIGN (Border + All Text)
        c.setStrokeColor(colors.darkblue)
        c.setLineWidth(5)
        c.rect(0.5*inch, 0.5*inch, width-1*inch, height-1*inch)
        
        c.setFont("Helvetica-Bold", 40)
        c.drawCentredString(width / 2, height - 2.5*inch, "Certificate of Completion")
        
        c.setFont("Helvetica", 20)
        c.drawCentredString(width / 2, height - 3.5*inch, "This certifies that")

        c.setFont("Helvetica-Bold", 30)
        c.setFillColor(colors.darkblue)
        student_name = f"{user.first_name} {user.last_name}".strip() or user.username
        c.drawCentredString(width / 2, height - 4.2*inch, student_name)

        c.setFont("Helvetica", 20)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 5*inch, "has successfully completed the course")
        c.setFont("Helvetica-Bold", 25)
        c.drawCentredString(width / 2, height - 5.8*inch, course.title)

        c.setFont("Helvetica", 15)
        instructor_name = f"{course.instructor.full_name or course.instructor.username}"
        c.drawString(2*inch, 2*inch, f"Instructor: {instructor_name}")
        
        formatted_date = cert.issue_date.strftime('%Y-%m-%d')
        c.drawString(width - 4*inch, 2*inch, f"Date: {formatted_date}")
        
        c.setFont("Helvetica", 10)
        c.drawCentredString(width / 2, 1*inch, f"Certificate ID: {cert.certificate_id}")

    c.showPage()
    c.save()


    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=f'Certificate_{course.title}.pdf')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_certificates(request):
    certs = Certificate.objects.filter(student=request.user).order_by('-issue_date')
    serializer = CertificateSerializer(certs, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_payouts(request):
    queryset = Payout.objects.all().order_by('-created_at')

    status_filter = request.query_params.get('status')
    if status_filter:
        queryset = queryset.filter(status=status_filter)

    month_filter = request.query_params.get('month') # Format YYYY-MM
    if month_filter:
        queryset = queryset.filter(month__startswith=month_filter)

    instructor_id = request.query_params.get('instructor_id')
    if instructor_id:
        queryset = queryset.filter(instructor_id=instructor_id)

    serializer = PayoutSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def generate_monthly_payouts(request):

    target_month_str = request.data.get('month') 
    
    if target_month_str:
        first_day = datetime.strptime(target_month_str, "%Y-%m").date()
    else:

        today = timezone.now().date()
        first_day = (today.replace(day=1) - relativedelta(months=1))

    last_day = first_day + relativedelta(months=1, days=-1)

    print(f"DEBUG: Calculating Payouts for {first_day} to {last_day}")


    revenue_data = OrderItem.objects.filter(
        order__status='SUCCESS', 
        order__created_at__date__gte=first_day,
        order__created_at__date__lte=last_day
    ).values('course__instructor').annotate(
        total_revenue=Sum('price')
    )

    created_count = 0
    updated_count = 0
    skipped_count = 0


    for entry in revenue_data:
        instructor_id = entry['course__instructor']
        total_revenue = entry['total_revenue'] or Decimal('0.00')
        

        payout_amount = total_revenue * Decimal('0.70')

        if payout_amount <= 0:
            continue


        payout = Payout.objects.filter(
            instructor_id=instructor_id,
            month=first_day
        ).first()

        if payout:

            if payout.status == 'PENDING':
                payout.amount = payout_amount
                payout.save()
                updated_count += 1
            else:

                skipped_count += 1
        else:

            Payout.objects.create(
                instructor_id=instructor_id,
                amount=payout_amount,
                month=first_day,
                status='PENDING'
            )
            created_count += 1

    return Response({
        'message': f'Calculation for {first_day.strftime("%B %Y")} complete.',
        'created': created_count,
        'updated': updated_count,
        'locked_paid': skipped_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mark_payout_paid(request, payout_id):
    payout = get_object_or_404(Payout, pk=payout_id)
    payout.status = 'PAID'
    payout.paid_at = timezone.now()
    payout.save()
    return Response({'message': 'Payout marked as PAID'})


@api_view(['POST','GET'])
@permission_classes([AllowAny])
def support_view(request):
    if request.method == 'GET':
        if not request.user.is_staff:
            return Response({"detail": "Only admins can view support messages."}, status=status.HTTP_403_FORBIDDEN)
        supports = Support.objects.all().order_by('-created_at')
        serializer = SupportSerializer(supports, many=True)
        return Response(serializer.data)

    serializer = SupportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)