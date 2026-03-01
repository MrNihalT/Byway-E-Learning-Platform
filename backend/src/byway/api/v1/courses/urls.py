from django.urls import path
from . import views
from . import serializers

urlpatterns = [
    # PUBLIC BROWSING
    path('courses/', views.course_list, name='course-list'),
    path('courses/<int:pk>/', views.course_detail, name='course-detail'),
    path('courses/<int:pk>/reviews/', views.course_review_list, name='course-review-list'),
    path('home/courses-by-category/', views.home_page_courses, name='home-courses-by-cat'),
    path('courses/<int:pk>/certificate/', views.download_certificate, name='download-certificate'),
    path('student/certificates/', views.my_certificates, name='my-certificates'),
    
    path('categories/', views.category_list, name='category-list'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),
    
    path('top-sellers/', views.seller_list, name="seller-list"),
    path('public-stats/', views.get_public_stats, name='public-stats'),
    path('courses/instructor/<int:pk>/', views.get_instructor_courses, name="instructor-courses"),


    # STUDENT LEARNING
    path('student/my-learning/', views.student_enrolled_courses, name='student-my-learning'),
    path('student/assignments/', views.student_assignment_list, name='student-assignments'),
    
    # Lecture Access & Completion
    path('lectures/<int:pk>/', views.lecture_detail_view, name='lecture-detail'),
    path('lectures/<int:lecture_pk>/complete/', views.mark_lecture_complete, name='lecture-complete'),
    
    # Submissions (Quiz & Assignment)
    path('quizzes/<int:quiz_pk>/submit/', views.submit_quiz, name='submit-quiz'),
    path('assignments/<int:assignment_pk>/submit/', views.submit_assignment, name='submit-assignment'),
    
    # Reviews
    path('courses/reviews/create/<int:course_id>/', views.create_course_review, name="create-course-review"),


    # INSTRUCTOR DASHBOARD
    # Instructor Analytics
    path('dashboard/instructor/', views.instructor_dashboard_stats, name='instructor-dashboard-stats'),

    # Course CRUD
    path('courses/create/', views.create_course, name="create-course"),
    path('instructor/my-courses/', views.instructor_my_courses, name="instructor-my-courses"),
    path('instructor/edit-course/<int:pk>/', views.edit_course, name="edit-course"),
    
    # Curriculum Management
    path('courses/<int:course_pk>/add-section/', views.add_section_to_course, name="add-section"),
    path('sections/<int:section_pk>/add-content/', views.add_content_to_section, name="add-content"),
    
    # Deletion
    path('sections/<int:pk>/delete/', views.delete_section, name='delete-section'),
    path('contents/<int:pk>/delete/', views.delete_content, name='delete-content'),

    # Grading
    path('instructor/pending-work/', views.get_instructor_pending_work, name='instructor-pending-work'),
    path('instructor/assignment/grade/<int:submission_pk>/', views.grade_assignment, name='grade-assignment'),


    # E-COMMERCE
    path('cart/', views.cart_view, name='cart-view'),
    path('cart/<int:course_id>/remove/', views.remove_from_cart, name='remove-from-cart'),
    
    path('wishlist/', views.wishlist_view, name='wishlist-view'),
    path('wishlist/<int:course_id>/remove/', views.remove_from_wishlist, name='remove-from-wishlist'),


    # PAYMENTS
    # Single Course Purchase
    path('create-razorpay-order/', views.create_razorpay_order, name='create-razorpay-order'),
    path('verify-razorpay-payment/', views.verify_razorpay_payment, name='verify-razorpay-payment'),
    
    # Bulk Cart Checkout
    path('cart/checkout/', views.checkout_cart, name='cart-checkout'),
    path('cart/verify-payment/', views.verify_razorpay_payment, name='cart-verify-payment'),


    # ADMIN DASHBOARD
    # Admin Analytics
    path('dashboard/admin/', views.get_admin_stats, name='admin-dashboard-stats'),
    
    path('admin/all-courses/', views.get_all_courses_admin, name='admin-all-courses'),
    
    # Category Management
    path('admin/categories/create/', views.admin_create_category, name='admin-create-category'),
    path('admin/categories/<int:pk>/edit/', views.admin_edit_category, name='admin-edit-category'),


    # PLATFORM REVIEWS
    path('platform/reviews/', views.get_platform_reviews, name='platform-reviews'),
    path('platform/reviews/create/', views.create_platform_review, name='create-platform-review'),
    path('admin/payouts/', views.get_payouts, name='admin_payouts'),
    path('admin/payouts/generate/', views.generate_monthly_payouts, name='admin_generate_payouts'),
    path('admin/payouts/<int:payout_id>/pay/', views.mark_payout_paid, name='admin_pay_payout'),

    path('support/', views.support_view, name='support'),
]