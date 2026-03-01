from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F
from community.models import Comment, CommunityPost, PollOption, PollVote, Report
from api.v1.community.serializers import CommunityPostSerializer, CommentSerializer, ReportSerializer
from rest_framework.permissions import IsAdminUser
#  POSTS 

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_list_create(request):
    if request.method == 'GET':
        posts = CommunityPost.objects.all().order_by('-created_at')
        serializer = CommunityPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
       
        serializer = CommunityPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def post_detail_action(request, pk):
    post = get_object_or_404(CommunityPost, pk=pk)

    if post.user != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PATCH':
        serializer = CommunityPostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#  COMMENTS 

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_list_create(request, post_pk):
    post = get_object_or_404(CommunityPost, pk=post_pk)

    if request.method == 'GET':
        comments = post.comments.filter(parent=None).order_by('-created_at') 
       
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        
        response_data = serializer.data

        return Response(response_data)

    elif request.method == 'POST':
        if post.is_comments_disabled:
            return Response({'error': 'Comments are disabled for this post'}, status=400)

        parent_id = request.data.get('parent')
        parent_comment = None
        if parent_id:
            parent_comment = get_object_or_404(Comment, pk=parent_id)

        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, post=post, parent=parent_comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    if comment.user == request.user or comment.post.user == request.user or request.user.is_superuser:
        comment.delete()
        return Response({"message": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    return Response({'error': 'You are not authorized to delete this comment'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pin_comment(request, post_pk, comment_pk):
    post = get_object_or_404(CommunityPost, pk=post_pk)
    comment = get_object_or_404(Comment, pk=comment_pk)

    if post.user != request.user:
        return Response({'error': 'Only the post author can pin comments'}, status=403)
    
    if comment.post != post:
        return Response({'error': 'Comment does not belong to this post'}, status=400)

    if post.pinned_comment == comment:
        post.pinned_comment = None
    else:
        post.pinned_comment = comment
    
    post.save()
    return Response({'status': 'success', 'pinned_comment_id': post.pinned_comment.id if post.pinned_comment else None})

#  LIKES 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    post = get_object_or_404(CommunityPost, pk=pk)
    user = request.user
    
    if post.likes.filter(id=user.id).exists():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True
    
    return Response({'liked': liked, 'total_likes': post.total_likes})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_poll(request, post_pk, option_pk):
    post = get_object_or_404(CommunityPost, pk=post_pk)
    option = get_object_or_404(PollOption, pk=option_pk)

    if post.post_type != 'poll':
        return Response({'error': 'This is not a poll'}, status=400)


    if PollVote.objects.filter(user=request.user, post=post).exists():
        return Response({'error': 'You have already voted on this poll'}, status=400)

    PollVote.objects.create(user=request.user, post=post, poll_option=option)
    

    option.vote_count = F('vote_count') + 1
    option.save()

    return Response({'status': 'voted'})

# REPORTING 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_content(request):
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(reporter=request.user)
        return Response({'message': 'Report submitted'}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reports(request):
    reports = Report.objects.all().order_by('-created_at')
    serializer = ReportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)

# USER PROFILE - My Posts & My Comments

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):
   
    posts = CommunityPost.objects.filter(user=request.user).order_by('-created_at')
    serializer = CommunityPostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_comments(request):
    """Returns only the comments made by the currently logged-in user."""
    comments = Comment.objects.filter(user=request.user).order_by('-created_at')
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)