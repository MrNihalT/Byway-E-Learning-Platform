from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model


from chat.models import Conversation, Message ,GroupChat , GroupChatMessage
from api.v1.chat.serializers import MessageSerializer, ConversationSerializer ,GroupChatMessageSerializer,GroupChatSerializer , UserSimpleSerializer
from courses.models import Enrollment

User = get_user_model()


# LIST CONVERSATIONS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    user = request.user
    filter_mode = request.query_params.get('filter')
    

    conversations = Conversation.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).order_by('-updated_at')


    if filter_mode == 'students':
       
        my_student_ids = Enrollment.objects.filter(
            course__instructor=user
        ).values_list('student__id', flat=True)
        
        conversations = conversations.filter(
            Q(user1__id__in=my_student_ids) | Q(user2__id__in=my_student_ids)
        )


    elif filter_mode == 'instructors':

        my_instructor_ids = Enrollment.objects.filter(
            student=user
        ).values_list('course__instructor__id', flat=True)
        
        conversations = conversations.filter(
            Q(user1__id__in=my_instructor_ids) | Q(user2__id__in=my_instructor_ids)
        )

    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)



# START  CHAT

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    user = request.user
    other_user_id = request.data.get('user_id')
    
    if not other_user_id:
        return Response({'error': "user_id is required"}, status=400)

    other_user = get_object_or_404(User, pk=other_user_id)

    if user.id == other_user.id:
        return Response({'error': "You can't chat with yourself"}, status=400)

    conversation = Conversation.objects.filter(
        (Q(user1=user) & Q(user2=other_user)) |
        (Q(user1=other_user) & Q(user2=user))
    ).first()


    if not conversation:
        conversation = Conversation.objects.create(user1=user, user2=other_user)

    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data)


#CHAT MESSAGES

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, conversation_id):
    conversation = get_object_or_404(Conversation, pk=conversation_id)
    user = request.user

    if user != conversation.user1 and user != conversation.user2:
        return Response({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        messages = conversation.messages.all().order_by('created_at')
        
        unread = messages.filter(is_read=False).exclude(sender=user)
        unread.update(is_read=True)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


    elif request.method == 'POST':
        text = request.data.get('text')
        if not text: 
            return Response({'error': 'Empty message'}, status=400)

        msg = Message.objects.create(
            conversation=conversation, 
            sender=user, 
            text=text
        )
        
       
        conversation.save() 
        
        return Response(MessageSerializer(msg).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    name = request.data.get('name')
    description = request.data.get('description', '')
    member_ids = request.data.get('members', []) 

    if not name:
        return Response({'error': 'Group name is required'}, status=400)

    group = GroupChat.objects.create(
        name=name, 
        description=description, 
        admin=request.user
    )
    
    group.users.add(request.user)
    if member_ids:
        members = User.objects.filter(id__in=member_ids)
        group.users.add(*members)

    serializer = GroupChatSerializer(group, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_groups(request):
    
    groups = request.user.group_chats.all().order_by('-updated_at')
    
    serializer = GroupChatSerializer(groups, many=True, context={'request': request})
    
    return Response(serializer.data)



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group_messages(request, group_id):

    group = get_object_or_404(GroupChat, pk=group_id)
    user = request.user

    if not group.users.filter(id=user.id).exists():
        return Response({'error': 'You are not a member of this group'}, status=403)

    if request.method == 'GET':
        messages = group.messages.all().order_by('created_at')
        
        
        for msg in messages:
            msg.read_by.add(user)

        serializer = GroupChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        text = request.data.get('text')
        if not text: return Response({'error': 'Empty message'}, status=400)

        msg = GroupChatMessage.objects.create(
            group_chat=group, 
            sender=user, 
            text=text
        )
        
        group.updated_at = msg.created_at
        group.save() 
        
        return Response(GroupChatMessageSerializer(msg).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):

    query = request.query_params.get('q', '')
    if not query:
        return Response([])

    users = User.objects.filter(
        Q(username__icontains=query) | Q(email__icontains=query)
    ).exclude(id=request.user.id)[:10]

    serializer = UserSimpleSerializer(users, many=True, context={'request': request})
    
    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_members_to_group(request, group_id):

    group = get_object_or_404(GroupChat, pk=group_id)
    
   
    if not group.users.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to add others'}, status=403)

    member_ids = request.data.get('members', [])
    if member_ids:
        new_members = User.objects.filter(id__in=member_ids)
        group.users.add(*new_members) 

    return Response({'message': 'Members added successfully'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    group = get_object_or_404(GroupChat, pk=group_id)
    
    if group.users.filter(id=request.user.id).exists():
        group.users.remove(request.user)
        
        if group.users.count() == 0:
            group.delete()
            
        return Response({'message': 'You left the group'}, status=200)
    
    return Response({'error': 'You are not in this group'}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member_from_group(request, group_id):
    group = get_object_or_404(GroupChat, pk=group_id)
    

    if request.user != group.admin:
        return Response({'error': 'Only the admin can remove members'}, status=403)

    user_id = request.data.get('user_id')
    user_to_remove = get_object_or_404(User, pk=user_id)


    if user_to_remove == group.admin:
        return Response({'error': 'Cannot remove the admin'}, status=400)


    group.users.remove(user_to_remove)
    return Response({'message': 'User removed successfully'})