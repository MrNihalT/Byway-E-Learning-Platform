import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const PollComponent = ({ post, onVote }) => {
    const options = post.poll_options || [];
    const totalVotes = options.reduce((acc, opt) => acc + opt.vote_count, 0);

    return (
        <PollContainer>
            {options.map((option) => {
                const isVoted = post.user_voted_option === option.id;
                const percentage =
                    option.percentage !== undefined
                        ? option.percentage
                        : totalVotes === 0
                          ? 0
                          : Math.round((option.vote_count / totalVotes) * 100);

                return (
                    <PollOptionCard
                        key={option.id}
                        onClick={() =>
                            !post.user_voted_option &&
                            onVote(post.id, option.id)
                        }
                        disabled={!!post.user_voted_option}
                        isVoted={isVoted}
                    >
                        <div
                            style={{ flex: 1, position: "relative", zIndex: 2 }}
                        >
                            <PollText>
                                {option.text}
                                {post.user_voted_option && (
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {percentage}%
                                    </span>
                                )}
                            </PollText>
                        </div>

                        {post.user_voted_option && (
                            <ProgressBar width={percentage} isVoted={isVoted} />
                        )}

                        {isVoted && <CheckMark>✓</CheckMark>}
                    </PollOptionCard>
                );
            })}
            <PollFooter>
                {totalVotes} votes •{" "}
                {post.user_voted_option ? "Voted" : "Select an option"}
            </PollFooter>
        </PollContainer>
    );
};

const Lightbox = ({ image, onClose }) => {
    if (!image) return null;
    return ReactDOM.createPortal(
        <LightboxOverlay onClick={onClose}>
            <LightboxContent onClick={(e) => e.stopPropagation()}>
                <LightboxImage src={image} />
                <CloseLightboxBtn onClick={onClose}>✕</CloseLightboxBtn>
            </LightboxContent>
        </LightboxOverlay>,
        document.body,
    );
};

const MediaGallery = ({ images, singleImage }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const currentLightboxImage = singleImage
        ? singleImage
        : images && images.length > 0
          ? images[currentIndex].image
          : null;

    if (singleImage) {
        return (
            <>
                <GalleryContainer onClick={() => setLightboxOpen(true)}>
                    <MainImage src={singleImage} />
                </GalleryContainer>
                {lightboxOpen && (
                    <Lightbox
                        image={singleImage}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}
            </>
        );
    }

    if (!images || images.length === 0) return null;

    return (
        <>
            <GalleryContainer>
                <MainImage
                    src={images[currentIndex].image}
                    onClick={() => setLightboxOpen(true)}
                />
                {images.length > 1 && (
                    <>
                        <NavButton
                            direction="left"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex((prev) =>
                                    prev === 0 ? images.length - 1 : prev - 1,
                                );
                            }}
                        >
                            ❮
                        </NavButton>
                        <NavButton
                            direction="right"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex((prev) =>
                                    prev === images.length - 1 ? 0 : prev + 1,
                                );
                            }}
                        >
                            ❯
                        </NavButton>
                        <DotsContainer>
                            {images.map((_, idx) => (
                                <Dot
                                    key={idx}
                                    active={idx === currentIndex}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                />
                            ))}
                        </DotsContainer>
                    </>
                )}
            </GalleryContainer>

            {lightboxOpen && (
                <Lightbox
                    image={currentLightboxImage}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
};

function CommentItem({
    comment,
    postId,
    onReplySubmit,
    onDeleteComment,
    onPinComment,
    isAuthor,
}) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const { userData } = useContext(UserContext);

    const handleSubmit = () => {
        if (!replyText.trim()) return;
        onReplySubmit(postId, replyText, comment.id);
        setReplyText("");
        setIsReplying(false);
    };

    return (
        <StyledComment isPinned={comment.is_pinned}>
            {comment.is_pinned && (
                <PinnedLabel>📌 Pinned by Author</PinnedLabel>
            )}

            <CommentHeader>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <SmallAvatar
                        src={
                            comment.user_avatar ||
                            "https://via.placeholder.com/30"
                        }
                    />
                    <strong>{comment.user_name}</strong>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <DateSpan>
                        {new Date(comment.created_at).toLocaleDateString()}
                    </DateSpan>
                    {isAuthor && !comment.parent && (
                        <ActionIcon
                            onClick={() => onPinComment(postId, comment.id)}
                        >
                            {comment.is_pinned ? "Unpin" : "Pin"}
                        </ActionIcon>
                    )}
                </div>
            </CommentHeader>

            <CommentText>{comment.text}</CommentText>

            <CommentActions>
                <ReplyButton onClick={() => setIsReplying(!isReplying)}>
                    Reply
                </ReplyButton>
                {userData &&
                    (userData.username === comment.user_name ||
                        isAuthor ||
                        userData.is_superuser) && (
                        <DeleteBtn onClick={() => onDeleteComment(comment.id)}>
                            Delete
                        </DeleteBtn>
                    )}
            </CommentActions>

            {isReplying && (
                <ReplyInputBox>
                    <SmallInput
                        autoFocus
                        placeholder="Reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <SendBtn onClick={handleSubmit}>Send</SendBtn>
                </ReplyInputBox>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <RepliesContainer>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onReplySubmit={onReplySubmit}
                            onDeleteComment={onDeleteComment}
                            isAuthor={isAuthor}
                            onPinComment={() => {}}
                        />
                    ))}
                </RepliesContainer>
            )}
        </StyledComment>
    );
}

function PostCard({ post, onLike, onVote, onUpdatePost, showActions }) {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentsList, setCommentsList] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        api.get(`community/posts/${post.id}/comments/`).then((res) => {
            setCommentsList(res.data);
        });
    }, [post]);
    const addReplyToState = (list, newComment, parentId) => {
        return list.map((c) => {
            if (c.id === parentId)
                return { ...c, replies: [...(c.replies || []), newComment] };
            else if (c.replies)
                return {
                    ...c,
                    replies: addReplyToState(c.replies, newComment, parentId),
                };
            return c;
        });
    };
    const removeCommentFromState = (list, targetId) => {
        return list
            .filter((c) => c.id !== targetId)
            .map((c) => ({
                ...c,
                replies: c.replies
                    ? removeCommentFromState(c.replies, targetId)
                    : [],
            }));
    };

    const handleCommentSubmit = async (postId, text, parentId = null) => {
        try {
            const res = await api.post(`community/posts/${postId}/comments/`, {
                text,
                parent: parentId,
            });
            if (parentId)
                setCommentsList(
                    addReplyToState(commentsList, res.data, parentId),
                );
            else setCommentsList([res.data, ...commentsList]);
        } catch (err) {
            toast.error("Failed to post comment");
        }
    };

    const handleDeleteComment = async (commentId) => {
        const result = await MySwal.fire({
            title: "Delete Comment?",
            text: "This comment will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`community/comments/${commentId}/delete/`);
            setCommentsList(removeCommentFromState(commentsList, commentId));
        } catch (err) {
            toast.error("Error deleting comment");
        }
    };

    const handlePinComment = async (postId, commentId) => {
        try {
            await api.post(
                `community/posts/${postId}/comments/${commentId}/pin/`,
            );
            const res = await api.get(`community/posts/${postId}/comments/`);
            setCommentsList(res.data);
        } catch (err) {
            toast.error("Error pinning comment");
        }
    };

    const handleReport = async () => {
        const result = await MySwal.fire({
            title: "Report Post",
            text: "Why are you reporting this post?",
            icon: "warning",
            input: "select",
            inputOptions: {
                spam: "🚫 Spam",
                harassment: "😡 Harassment",
                inappropriate: "⚠️ Inappropriate Content",
            },
            inputPlaceholder: "Select a reason",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Submit Report",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value) return "Please select a reason to report.";
            },
        });
        if (!result.isConfirmed) return;
        try {
            await api.post("community/report/", {
                post: post.id,
                reason: result.value,
            });
            toast.success("Report submitted. Thank you!");
        } catch (err) {
            toast.error("Failed to submit report");
        }
    };

    const handleDeletePost = async () => {
        const result = await MySwal.fire({
            title: "Delete Post?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`community/posts/${post.id}/`);
            onUpdatePost(post.id);
            toast.success("Post deleted successfully.");
        } catch (err) {
            toast.error("Error deleting post");
        }
    };

    return (
        <Card>
            <HeaderRow>
                <UserInfo onClick={() => navigate(`/student/${post.user}`)}>
                    <Avatar
                        src={
                            post.user_avatar || "https://via.placeholder.com/40"
                        }
                    />
                    <div>
                        <UserName>{post.user_name}</UserName>
                        <DateText>
                            {new Date(post.created_at).toLocaleDateString()}
                        </DateText>
                    </div>
                </UserInfo>

                <MenuContainer>
                    <MenuDots onClick={() => setMenuOpen(!menuOpen)}>
                        ⋮
                    </MenuDots>
                    {menuOpen && (
                        <Dropdown>
                            {userData?.username === post.user_name && (
                                <DropdownItem onClick={handleDeletePost}>
                                    Delete Post
                                </DropdownItem>
                            )}
                            <DropdownItem onClick={handleReport}>
                                Report
                            </DropdownItem>
                        </Dropdown>
                    )}
                </MenuContainer>
            </HeaderRow>

            {showActions && (
                <PostActionBar>
                    <PostActionBtn danger onClick={handleDeletePost}>
                        🗑️ Delete
                    </PostActionBtn>
                </PostActionBar>
            )}

            <PostTitle>{post.title}</PostTitle>
            <Content>{post.description}</Content>

            {post.post_type === "video" && post.video && (
                <VideoPlayer controls>
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                </VideoPlayer>
            )}

            {post.image ||
                (post.images && post.images.length > 0 && (
                    <MediaGallery
                        singleImage={post.image}
                        images={post.images}
                    />
                ))}

            {post.post_type === "poll" && (
                <PollComponent post={post} onVote={onVote} />
            )}

            <ActionRow>
                <LikeBtn liked={post.is_liked} onClick={onLike}>
                    {post.is_liked ? "❤️" : "🤍"} {post.total_likes}
                </LikeBtn>
                <CommentBtn onClick={() => setShowComments(!showComments)}>
                    💬 {commentsList.length}
                </CommentBtn>
            </ActionRow>

            {showComments && (
                <CommentSection>
                    {!post.is_comments_disabled ? (
                        <CommentInputBox>
                            <SmallInput
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <SendBtn
                                onClick={() => {
                                    handleCommentSubmit(post.id, commentText);
                                    setCommentText("");
                                }}
                            >
                                Post
                            </SendBtn>
                        </CommentInputBox>
                    ) : (
                        <div
                            style={{
                                padding: "10px",
                                color: "#777",
                                textAlign: "center",
                            }}
                        >
                            Comments are turned off.
                        </div>
                    )}

                    {commentsList.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            postId={post.id}
                            onReplySubmit={handleCommentSubmit}
                            onDeleteComment={handleDeleteComment}
                            onPinComment={handlePinComment}
                            isAuthor={userData?.username === post.user_name}
                        />
                    ))}
                </CommentSection>
            )}
        </Card>
    );
}

export default function Community() {
    const { userData } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedTab, setFeedTab] = useState("all"); // "all" | "mine"
    const [myPosts, setMyPosts] = useState([]);
    const [myPostsLoading, setMyPostsLoading] = useState(false);

    const [postType, setPostType] = useState("text");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // Single file (Image or Video)
    const [previewUrl, setPreviewUrl] = useState(null);
    const [pollOptions, setPollOptions] = useState(["", ""]);

    useEffect(() => {
        api.get("community/posts/").then((res) => {
            setPosts(res.data);
            setLoading(false);
        });
    }, []);

    const fetchMyPosts = () => {
        setMyPostsLoading(true);
        api.get("community/my/posts/")
            .then((res) => setMyPosts(res.data))
            .catch((err) => console.error(err))
            .finally(() => setMyPostsLoading(false));
    };

    const handleFeedTab = (tab) => {
        setFeedTab(tab);
        if (tab === "mine" && myPosts.length === 0) {
            fetchMyPosts();
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleCreatePost = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("post_type", postType);

        if ((postType === "image" || postType === "poll") && selectedFile) {
            formData.append("uploaded_images", selectedFile);
        }

        if (postType === "video" && selectedFile) {
            formData.append("video", selectedFile);
        }

        if (postType === "poll") {
            const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
            if (validOptions.length < 2) {
                toast.error("Poll must have at least 2 options.");
                return;
            }
            validOptions.forEach((opt) => {
                formData.append("poll_options_data", opt);
            });
        }

        try {
            const res = await api.post("community/posts/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPosts([res.data, ...posts]);
            setTitle("");
            setDescription("");
            setSelectedFile(null);
            setPreviewUrl(null);
            setPollOptions(["", ""]);
            setPostType("text");
        } catch (err) {
            console.error(err);
            toast.error("Error creating post. Check connection or data.");
        }
    };

    const handleLike = async (postId) => {
        const res = await api.post(`community/posts/${postId}/like/`);
        setPosts(
            posts.map((p) =>
                p.id === postId
                    ? {
                          ...p,
                          is_liked: res.data.liked,
                          total_likes: res.data.total_likes,
                      }
                    : p,
            ),
        );
    };

    const handleVote = async (postId, optionId) => {
        try {
            await api.post(`community/posts/${postId}/vote/${optionId}/`);
            const res = await api.get("community/posts/");
            setPosts(res.data);
        } catch (err) {
            toast.error("Vote failed");
        }
    };

    const handlePostDelete = (postId) => {
        setPosts(posts.filter((p) => p.id !== postId));
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    return (
        <>
            <Header />
            <Container>
                <PageTitle>Community Feed</PageTitle>

                {userData && (
                    <CreateBox>
                        <Tabs>
                            <Tab
                                active={postType === "text"}
                                onClick={() => {
                                    setPostType("text");
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                            >
                                📝 Text
                            </Tab>
                            <Tab
                                active={postType === "image"}
                                onClick={() => {
                                    setPostType("image");
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                            >
                                📷 Image
                            </Tab>
                            <Tab
                                active={postType === "video"}
                                onClick={() => {
                                    setPostType("video");
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                            >
                                🎥 Video
                            </Tab>
                            <Tab
                                active={postType === "poll"}
                                onClick={() => {
                                    setPostType("poll");
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                            >
                                📊 Poll
                            </Tab>
                        </Tabs>

                        <Input
                            placeholder={
                                postType === "poll"
                                    ? "Ask a question..."
                                    : "Title (Optional)"
                            }
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {postType !== "poll" && (
                            <TextArea
                                placeholder="What's on your mind?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        )}

                        {(postType === "image" || postType === "poll") && (
                            <div style={{ marginTop: "10px" }}>
                                <label
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#64748b",
                                        display: "block",
                                        marginBottom: "5px",
                                    }}
                                >
                                    {postType === "poll"
                                        ? "Add Context Image (Optional):"
                                        : "Upload Image:"}
                                </label>
                                {!previewUrl ? (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setPreviewUrl(
                                                    URL.createObjectURL(file),
                                                );
                                            }
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "fit-content",
                                        }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: "8px",
                                                display: "block",
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px",
                                                background: "rgba(0,0,0,0.6)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "14px",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {postType === "video" && (
                            <div style={{ marginTop: "10px" }}>
                                {!previewUrl ? (
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setPreviewUrl(
                                                    URL.createObjectURL(file),
                                                );
                                            }
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "fit-content",
                                        }}
                                    >
                                        <video
                                            src={previewUrl}
                                            controls
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: "8px",
                                                display: "block",
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px",
                                                background: "rgba(0,0,0,0.6)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "14px",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {postType === "poll" && (
                            <PollCreator>
                                {pollOptions.map((opt, idx) => (
                                    <Input
                                        key={idx}
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) =>
                                            handlePollOptionChange(
                                                idx,
                                                e.target.value,
                                            )
                                        }
                                    />
                                ))}
                                <SmallBtn
                                    onClick={() =>
                                        setPollOptions([...pollOptions, ""])
                                    }
                                >
                                    + Add Option
                                </SmallBtn>
                            </PollCreator>
                        )}

                        <FlexRow style={{ marginTop: "15px" }}>
                            <div />
                            <PostBtn onClick={handleCreatePost}>Post</PostBtn>
                        </FlexRow>
                    </CreateBox>
                )}

                {/* ── Feed Filter Tabs ── */}
                <FeedTabBar>
                    <FeedTab
                        active={feedTab === "all"}
                        onClick={() => handleFeedTab("all")}
                    >
                        🌐 All Posts
                    </FeedTab>
                    {userData && (
                        <FeedTab
                            active={feedTab === "mine"}
                            onClick={() => handleFeedTab("mine")}
                        >
                            👤 My Posts
                        </FeedTab>
                    )}
                </FeedTabBar>

                {feedTab === "all" ? (
                    loading ? (
                        <p style={{ textAlign: "center" }}>Loading...</p>
                    ) : (
                        posts.map((p) => (
                            <PostCard
                                key={p.id}
                                post={p}
                                onLike={() => handleLike(p.id)}
                                onVote={handleVote}
                                onUpdatePost={handlePostDelete}
                            />
                        ))
                    )
                ) : myPostsLoading ? (
                    <p style={{ textAlign: "center" }}>Loading your posts...</p>
                ) : myPosts.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color: "#94a3b8",
                            marginTop: "30px",
                        }}
                    >
                        You haven't posted anything yet.
                    </p>
                ) : (
                    myPosts.map((p) => (
                        <PostCard
                            key={p.id}
                            post={p}
                            onLike={() => handleLike(p.id)}
                            onVote={handleVote}
                            showActions
                            onUpdatePost={(id) => {
                                handlePostDelete(id);
                                setMyPosts((prev) =>
                                    prev.filter((x) => x.id !== id),
                                );
                            }}
                        />
                    ))
                )}
            </Container>
        </>
    );
}

const Container = styled.div`
    max-width: 680px;
    margin: 30px auto;
    padding: 0 15px;
`;
const PageTitle = styled.h1`
    text-align: center;
    margin-bottom: 25px;
    color: #1e293b;
`;

const CreateBox = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
const Tabs = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
`;
const Tab = styled.button`
    background: ${(p) => (p.active ? "#eff6ff" : "transparent")};
    color: ${(p) => (p.active ? "#2563eb" : "#64748b")};
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        background: #f1f5f9;
        transform: translateY(-1px);
    }
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    width: 100%;
    outline: none;
    transition: all 0.2s;
    &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;
const TextArea = styled.textarea`
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    height: 100px;
    resize: none;
    width: 100%;
    outline: none;
    transition: all 0.2s;
    &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;
const FlexRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const PostBtn = styled.button`
    padding: 10px 24px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    &:hover {
        background: #1d4ed8;
    }
`;
const SmallBtn = styled.button`
    padding: 6px 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    align-self: flex-start;
`;

const Card = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 25px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
`;
const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
`;
const UserInfo = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    cursor: pointer;
`;
const Avatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
`;
const UserName = styled.h4`
    margin: 0;
    font-size: 15px;
    color: #0f172a;
`;
const DateText = styled.span`
    font-size: 12px;
    color: #94a3b8;
`;
const MenuContainer = styled.div`
    position: relative;
`;
const MenuDots = styled.span`
    cursor: pointer;
    font-size: 20px;
    color: #64748b;
    padding: 0 5px;
`;
const Dropdown = styled.div`
    position: absolute;
    right: 0;
    top: 25px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 120px;
    z-index: 10;
`;
const DropdownItem = styled.div`
    padding: 10px;
    font-size: 14px;
    cursor: pointer;
    &:hover {
        background: #f8fafc;
    }
`;

const PostTitle = styled.h3`
    margin-bottom: 8px;
    font-size: 18px;
    color: #1e293b;
`;
const Content = styled.p`
    margin-bottom: 15px;
    color: #334155;
    line-height: 1.5;
    white-space: pre-wrap;
`;

// Media Styles
const GalleryContainer = styled.div`
    position: relative;
    width: 100%;
    height: 350px;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
`;
const MainImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
    cursor: zoom-in;
`;
const NavButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(p) =>
        p.direction === "left"
            ? "left: 10px;"
            : "right: 10px;"} background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
`;
const DotsContainer = styled.div`
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
`;
const Dot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => (p.active ? "white" : "rgba(255,255,255,0.5)")};
    cursor: pointer;
`;
const VideoPlayer = styled.video`
    width: 100%;
    border-radius: 8px;
    margin-bottom: 15px;
    background: black;
    max-height: 400px;
`;

// Poll Styles
const PollContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
`;
const PollCreator = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
const PollOptionCard = styled.div`
    position: relative;
    padding: 12px;
    border: 1px solid ${(p) => (p.isVoted ? "#3b82f6" : "#e2e8f0")};
    border-radius: 8px;
    cursor: ${(p) => (p.disabled ? "default" : "pointer")};
    overflow: hidden;
    transition: all 0.2s;
    &:hover {
        border-color: ${(p) => (p.disabled ? "" : "#3b82f6")};
        background: ${(p) => (p.disabled ? "" : "#f8fafc")};
    }
`;
const PollText = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    color: #334155;
    width: 100%;
    align-items: center;
`;
const ProgressBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${(p) => p.width}%;
    background-color: ${(p) => (p.isVoted ? "#dbeafe" : "#f1f5f9")};
    z-index: 1;
    transition: width 0.5s ease;
`;
const CheckMark = styled.span`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #2563eb;
    font-weight: bold;
    z-index: 3;
`;
const PollFooter = styled.div`
    font-size: 13px;
    color: #64748b;
    margin-top: 5px;
`;

// Comments
const ActionRow = styled.div`
    display: flex;
    gap: 20px;
    border-top: 1px solid #f1f5f9;
    padding-top: 15px;
    margin-top: 5px;
`;
const LikeBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${(p) => (p.liked ? "#ef4444" : "#64748b")};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
`;
const CommentBtn = styled(LikeBtn)`
    color: #64748b;
`;
const CommentSection = styled.div`
    background: #f8fafc;
    padding: 15px;
    margin-top: 15px;
    border-radius: 8px;
`;
const CommentInputBox = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
`;
const SmallInput = styled.input`
    flex: 1;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
    &:focus {
        border-color: #cbd5e1;
    }
`;
const SendBtn = styled.button`
    padding: 6px 16px;
    background: #334155;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
`;

const StyledComment = styled.div`
    border-left: 2px solid ${(p) => (p.isPinned ? "#f59e0b" : "#e2e8f0")};
    padding-left: 12px;
    margin-bottom: 15px;
    background: ${(p) => (p.isPinned ? "#fffbeb" : "transparent")};
    padding: ${(p) => (p.isPinned ? "10px" : "0 0 0 12px")};
    border-radius: ${(p) => (p.isPinned ? "8px" : "0")};
`;
const PinnedLabel = styled.div`
    font-size: 11px;
    color: #d97706;
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
`;
const CommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 5px;
`;
const SmallAvatar = styled.img`
    width: 24px;
    height: 24px;
    border-radius: 50%;
`;
const DateSpan = styled.span`
    font-size: 11px;
    color: #94a3b8;
`;
const ActionIcon = styled.span`
    font-size: 11px;
    color: #64748b;
    cursor: pointer;
    &:hover {
        color: #3b82f6;
    }
`;
const CommentText = styled.p`
    font-size: 14px;
    color: #334155;
    margin-bottom: 8px;
    line-height: 1.4;
`;
const CommentActions = styled.div`
    display: flex;
    gap: 15px;
`;
const ReplyButton = styled.button`
    background: none;
    border: none;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;
    padding: 0;
    font-weight: 500;
    &:hover {
        color: #3b82f6;
    }
`;
const DeleteBtn = styled(ReplyButton)`
    color: #ef4444;
    &:hover {
        color: #dc2626;
    }
`;
const RepliesContainer = styled.div`
    margin-top: 10px;
    margin-left: 10px;
`;
const ReplyInputBox = styled.div`
    display: flex;
    gap: 5px;
    margin: 10px 0;
`;

// Lightbox Styles
const LightboxOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    animation: fadeIn 0.2s ease-in-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const LightboxContent = styled.div`
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
`;

const LightboxImage = styled.img`
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
`;

const CloseLightboxBtn = styled.button`
    position: absolute;
    top: -40px;
    right: 0;
    background: transparent;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
    opacity: 0.8;
    &:hover {
        opacity: 1;
        transform: scale(1.1);
    }
`;

const FeedTabBar = styled.div`
    display: flex;
    gap: 8px;
    margin: 18px 0 14px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0;
`;

const FeedTab = styled.button`
    background: none;
    border: none;
    border-bottom: 3px solid ${(p) => (p.active ? "#2563eb" : "transparent")};
    color: ${(p) => (p.active ? "#2563eb" : "#64748b")};
    font-weight: ${(p) => (p.active ? "700" : "500")};
    font-size: 0.9rem;
    padding: 8px 16px;
    cursor: pointer;
    margin-bottom: -2px;
    transition:
        color 0.2s,
        border-color 0.2s;
    &:hover {
        color: #2563eb;
    }
`;

const PostActionBar = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px 0 12px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 6px;
`;

const PostActionBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 14px;
    border-radius: 6px;
    border: 1.5px solid ${(p) => (p.danger ? "#ef4444" : "#f59e0b")};
    background: ${(p) => (p.danger ? "#fff5f5" : "#fffbeb")};
    color: ${(p) => (p.danger ? "#dc2626" : "#b45309")};
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
        background: ${(p) => (p.danger ? "#fee2e2" : "#fef3c7")};
    }
`;
