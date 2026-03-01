import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import QuizCreator from "./QuizCreator";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    align-items: center;
`;

const PreviewButton = styled.button`
    padding: 14px 25px;
    background-color: #f8fafc;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.2s;
    &:hover {
        background-color: #f1f5f9;
        border-color: #cbd5e1;
    }
`;

const PublishButton = styled.button`
    padding: 14px 25px;
    background-color: #16a34a;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.2s;
    &:hover {
        background-color: #15803d;
    }
    &:disabled {
        background-color: #86efac;
    }
`;

const DeleteCourseButton = styled.button`
    padding: 14px 25px;
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.2s;
    &:hover {
        background-color: #b91c1c;
    }
    &:disabled {
        background-color: #fca5a5;
    }
`;

const DraftStatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 25px;
`;

const StatusLabel = styled.div`
    font-weight: 600;
    color: #475569;
    span {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.85rem;
        margin-left: 8px;
        text-transform: uppercase;
    }
    .draft {
        background: #fff7ed;
        color: #9a3412;
        border: 1px solid #ffedd5;
    }
    .live {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
    }
`;

const ToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    span {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 500;
    }
`;

const Switch = styled.label`
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
    input {
        opacity: 0;
        width: 0;
        height: 0;
    }
`;

const Slider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.4s;
    border-radius: 34px;
    &:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }
    input:checked + & {
        background-color: #3b82f6;
    }
    input:checked + &:before {
        transform: translateX(24px);
    }
`;

export default function EditCourse() {
    const { courseId } = useParams();
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    // --- State for the whole page ---
    const [course, setCourse] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Content Creation State ---
    const [contentType, setContentType] = useState("video");

    // State for specific content types
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [newAssignment, setNewAssignment] = useState({
        instructions: "",
        total_marks: 100,
        attachment: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingSection, setIsSubmittingSection] = useState(false);
    const [isSubmittingContent, setIsSubmittingContent] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // State for the main edit form
    const [editForm, setEditForm] = useState({
        title: "",
        short_description: "",
        description: "",
        price: "",
        offer_percentage: 0,
        total_time: "",
        difficulty: "BEGINNER",
        category_id: "",
        is_draft: false,
        is_deleted: false,
        existingImageUrl: "",
        course_image: null,
    });

    // State for new section form
    const [newSectionTitle, setNewSectionTitle] = useState("");

    // State for new content (lecture) form
    const [newContent, setNewContent] = useState({
        title: "",
        sectionId: "",
        youtube_url: "",
        video_file: null,
        pdf_file: null,
    });

    // UI state
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // --- Data Fetching ---
    useEffect(() => {
        api.get("course/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories", err));
    }, []);

    useEffect(() => {
        if (!userData) return;
        if (userData.role !== "instructor" && !userData.is_superuser) {
            navigate("/");
            return;
        }

        setIsLoading(true);
        api.get(`course/instructor/edit-course/${courseId}/`)
            .then((response) => {
                const courseData = response.data;
                setCourse(courseData);
                setEditForm({
                    title: courseData.title,
                    short_description: courseData.short_description,
                    description: courseData.description,
                    price: courseData.price,
                    offer_percentage: courseData.offer_percentage,
                    total_time: courseData.total_time,
                    difficulty: courseData.difficulty,
                    category_id: courseData.category?.id || "",
                    is_draft: courseData.is_draft,
                    is_deleted: courseData.is_deleted,
                    existingImageUrl: courseData.course_image || "",
                    course_image: null,
                });
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching course details:", err);
                setError("Could not load course data.");
                setIsLoading(false);
            });
    }, [courseId, userData, navigate]);

    // --- Handlers for Course Details ---
    const handleDetailChange = (e) => {
        const { id, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        setEditForm((prev) => ({
            ...prev,
            course_image: e.target.files[0],
            existingImageUrl: "",
        }));
    };

    const handleDetailSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        const formData = new FormData();
        formData.append("title", editForm.title);
        formData.append("short_description", editForm.short_description);
        formData.append("description", editForm.description);
        formData.append("price", editForm.price);
        formData.append("offer_percentage", editForm.offer_percentage);
        if (editForm.course_image) {
            formData.append("course_image", editForm.course_image);
        }
        formData.append("total_time", editForm.total_time);
        formData.append("difficulty", editForm.difficulty);
        if (editForm.category_id) {
            formData.append("category_id", editForm.category_id);
        }
        formData.append("is_draft", editForm.is_draft);
        formData.append("is_deleted", editForm.is_deleted);

        try {
            const response = await api.put(
                `course/instructor/edit-course/${courseId}/`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            setSuccessMessage(`Course updated successfully!`);
            setEditForm((prev) => ({
                ...prev,
                existingImageUrl: response.data.course_image || "",
                course_image: null,
            }));
            if (document.getElementById("course_image")) {
                document.getElementById("course_image").value = null;
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.data || "Failed to update course.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        const result = await MySwal.fire({
            title: "Publish Course?",
            text: "This will make your course live for students.",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, publish it!",
        });

        if (!result.isConfirmed) return;

        setIsPublishing(true);
        try {
            const formData = new FormData();
            formData.append("is_draft", false);
            // We only need to flip is_draft, but the backend put endpoint might expect more or it might handle partial.
            // Based on handleDetailSubmit, it sends everything.
            Object.keys(editForm).forEach((key) => {
                if (key === "is_draft") {
                    formData.append(key, "false");
                } else if (key !== "course_image" && editForm[key] !== null) {
                    formData.append(key, editForm[key]);
                }
            });

            await api.put(
                `course/instructor/edit-course/${courseId}/`,
                formData,
            );
            setEditForm((prev) => ({ ...prev, is_draft: false }));
            setSuccessMessage("Course published successfully!");
            toast.success("Course is now LIVE!");
        } catch (err) {
            toast.error("Failed to publish course.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeleteCourse = async () => {
        // Double check if it's draft (though button is hidden if not)
        if (!editForm.is_draft) {
            toast.error("You cannot delete a published course.");
            return;
        }

        const result = await MySwal.fire({
            title: "Delete Course permanently?",
            text: "This action cannot be undone. All content will be lost.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`course/instructor/edit-course/${courseId}/`);
            toast.success("Course deleted successfully.");
            navigate("/my_courses");
        } catch (err) {
            toast.error("Failed to delete course.");
        }
    };

    // --- Handlers for Curriculum ---
    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionTitle) return;
        setIsSubmittingSection(true);
        setError("");
        try {
            const response = await api.post(
                `course/courses/${courseId}/add-section/`,
                {
                    title: newSectionTitle,
                    order: (course.sections?.length || 0) + 1,
                },
            );
            setCourse((prev) => ({
                ...prev,
                sections: [...prev.sections, response.data],
            }));
            setNewSectionTitle("");
        } catch (err) {
            setError("Failed to add section.");
        } finally {
            setIsSubmittingSection(false);
        }
    };

    const handleContentFormChange = (e) => {
        const { id, value, type, files } = e.target;
        if (type === "file") {
            if (files && files.length > 0) {
                setNewContent((prev) => ({ ...prev, [id]: files[0] }));
            }
        } else {
            setNewContent((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleAddContent = async (e) => {
        e.preventDefault();

        // 1. Validation
        if (!newContent.title || !newContent.sectionId) {
            setError("Please select a section and provide a title.");
            return;
        }

        setIsSubmittingContent(true);
        setError("");

        // 2. Setup Form Data
        const formData = new FormData();
        formData.append("title", newContent.title);

        const section = course.sections.find(
            (s) => s.id === parseInt(newContent.sectionId),
        );
        const newOrder = (section?.contents?.length || 0) + 1;
        formData.append("order", newOrder);

        // Map Frontend types to Backend 'lecture' type
        let backendContentType = contentType;
        if (["video", "youtube", "pdf"].includes(contentType)) {
            backendContentType = "lecture";
        }
        formData.append("content_type", backendContentType);

        // 3. Append Specific Data
        if (contentType === "youtube" && newContent.youtube_url) {
            formData.append("youtube_url", newContent.youtube_url);
        } else if (contentType === "video" && newContent.video_file) {
            formData.append("video_file", newContent.video_file);
        } else if (contentType === "pdf" && newContent.pdf_file) {
            formData.append("pdf_file", newContent.pdf_file);
        } else if (contentType === "quiz") {
            if (quizQuestions.length === 0) {
                setError("Please add at least one question for the quiz.");
                setIsSubmittingContent(false);
                return;
            }
            formData.append("questions", JSON.stringify(quizQuestions));
        } else if (contentType === "assignment") {
            if (!newAssignment.instructions) {
                setError("Instructions are required for assignments.");
                setIsSubmittingContent(false);
                return;
            }
            formData.append("instructions", newAssignment.instructions);
            formData.append("total_marks", newAssignment.total_marks);
            if (newAssignment.attachment) {
                formData.append("attachment", newAssignment.attachment);
            }
        }

        try {
            // FIX: DO NOT pass 'Content-Type': 'multipart/form-data'. Axios sets boundary automatically.
            await api.post(
                `course/sections/${newContent.sectionId}/add-content/`,
                formData,
            );

            // Refresh Data
            const updatedCourse = await api.get(
                `course/instructor/edit-course/${courseId}/`,
            );
            setCourse(updatedCourse.data);

            // Reset Form State
            setNewContent({
                title: "",
                sectionId: "",
                youtube_url: "",
                video_file: null,
                pdf_file: null,
            });
            setQuizQuestions([]);
            setNewAssignment({
                instructions: "",
                total_marks: 100,
                attachment: null,
            });

            // Clear inputs
            if (document.getElementById("video_file"))
                document.getElementById("video_file").value = null;
            if (document.getElementById("pdf_file"))
                document.getElementById("pdf_file").value = null;
            if (document.getElementById("assignment_file"))
                document.getElementById("assignment_file").value = null;
        } catch (err) {
            console.error("Upload Error:", err);

            // --- DETAILED ERROR ALERT ---
            let msg = "Failed to add content.";
            if (err.response && err.response.data) {
                // Try to make it readable
                if (typeof err.response.data === "object") {
                    const keys = Object.keys(err.response.data);
                    if (keys.length > 0) {
                        const firstKey = keys[0];
                        const val = err.response.data[firstKey];
                        const valText = Array.isArray(val) ? val[0] : val;
                        msg = `${firstKey}: ${valText}`;
                    }
                } else if (typeof err.response.data === "string") {
                    msg = err.response.data;
                }
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
            toast.error(`Backend Error: ${msg}`);
        } finally {
            setIsSubmittingContent(false);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        const result = await MySwal.fire({
            title: "Delete Section?",
            text: "This section and all its contents will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`course/sections/${sectionId}/delete/`);
            setCourse((prev) => ({
                ...prev,
                sections: prev.sections.filter((s) => s.id !== sectionId),
            }));
        } catch (err) {
            setError("Failed to delete section.");
        }
    };

    const handleDeleteContent = async (lectureId, sectionId) => {
        const result = await MySwal.fire({
            title: "Delete Content?",
            text: "This lecture/content will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`course/contents/${lectureId}/delete/`);
            setCourse((prev) => {
                const newSections = prev.sections.map((sec) => {
                    if (sec.id === sectionId) {
                        return {
                            ...sec,
                            contents: sec.contents.filter(
                                (c) => c.id !== lectureId,
                            ),
                        };
                    }
                    return sec;
                });
                return { ...prev, sections: newSections };
            });
        } catch (err) {
            setError("Failed to delete content.");
        }
    };

    if (isLoading) return <LoadingIndicator>Loading...</LoadingIndicator>;
    if (!userData) return <LoadingIndicator>Unauthorized</LoadingIndicator>;

    return (
        <>
            <Header />
            <FormContainer>
                <FormHeading>Edit Course: {editForm.title}</FormHeading>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                )}

                <DraftStatusHeader>
                    <StatusLabel>
                        Status:{" "}
                        {editForm.is_draft ? (
                            <span className="draft">Draft</span>
                        ) : (
                            <span className="live">Published</span>
                        )}
                    </StatusLabel>
                    <ToggleContainer>
                        <span>Draft Mode</span>
                        <Switch>
                            <input
                                type="checkbox"
                                checked={editForm.is_draft}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        is_draft: e.target.checked,
                                    }))
                                }
                            />
                            <Slider />
                        </Switch>
                    </ToggleContainer>
                </DraftStatusHeader>

                <StyledForm onSubmit={handleDetailSubmit}>
                    {/* ... (Basic Details Inputs) ... */}
                    <FormGroup>
                        <Label>Title</Label>
                        <Input
                            id="title"
                            value={editForm.title}
                            onChange={handleDetailChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Short Description</Label>
                        <Textarea
                            id="short_description"
                            value={editForm.short_description}
                            onChange={handleDetailChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Description</Label>
                        <Textarea
                            id="description"
                            value={editForm.description}
                            onChange={handleDetailChange}
                        />
                    </FormGroup>
                    <Row>
                        <FormGroup>
                            <Label>Price</Label>
                            <Input
                                type="number"
                                id="price"
                                value={editForm.price}
                                onChange={handleDetailChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Offer %</Label>
                            <Input
                                type="number"
                                id="offer_percentage"
                                value={editForm.offer_percentage}
                                onChange={handleDetailChange}
                            />
                        </FormGroup>
                    </Row>
                    <FormGroup>
                        <Label>Course Image</Label>
                        {editForm.existingImageUrl && (
                            <ImagePreview src={editForm.existingImageUrl} />
                        )}
                        <FileInput
                            type="file"
                            id="course_image"
                            onChange={handleImageChange}
                        />
                    </FormGroup>
                    <Row>
                        <FormGroup>
                            <Label>Time</Label>
                            <Input
                                id="total_time"
                                value={editForm.total_time}
                                onChange={handleDetailChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Difficulty</Label>
                            <Select
                                id="difficulty"
                                value={editForm.difficulty}
                                onChange={handleDetailChange}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">
                                    Intermediate
                                </option>
                                <option value="ADVANCED">Advanced</option>
                            </Select>
                        </FormGroup>
                    </Row>
                    <FormGroup>
                        <Label>Category</Label>
                        <Select
                            id="category_id"
                            value={editForm.category_id}
                            onChange={handleDetailChange}
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>
                    <ButtonGroup>
                        <SubmitButton disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Details"}
                        </SubmitButton>
                        {editForm.is_draft && (
                            <PublishButton
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishing}
                            >
                                {isPublishing
                                    ? "Publishing..."
                                    : "Publish Course"}
                            </PublishButton>
                        )}
                        <PreviewButton
                            as="a"
                            href={`/course/${courseId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Preview Course
                        </PreviewButton>
                        {editForm.is_draft && (
                            <DeleteCourseButton
                                type="button"
                                onClick={handleDeleteCourse}
                            >
                                Delete Course
                            </DeleteCourseButton>
                        )}
                    </ButtonGroup>
                    <small
                        style={{
                            color: "#64748b",
                            marginTop: "10px",
                            display: "block",
                        }}
                    >
                        * Preview opens your course in a new tab to see how it
                        looks for students.
                    </small>
                </StyledForm>
            </FormContainer>

            <CurriculumContainer>
                <FormHeading>Curriculum</FormHeading>

                {/* Sections List */}
                {course &&
                    course.sections.map((section) => (
                        <Section key={section.id}>
                            <SectionHeader>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <div style={{ color: "#3b82f6" }}>
                                        <BookIcon />
                                    </div>
                                    <span>{section.title}</span>
                                </div>
                                <IconButton
                                    danger
                                    onClick={() =>
                                        handleDeleteSection(section.id)
                                    }
                                    title="Delete Section"
                                >
                                    <TrashIcon />
                                </IconButton>
                            </SectionHeader>
                            <LectureList>
                                {section.contents.map((lec) => (
                                    <LectureItem key={lec.id}>
                                        <LectureInfo>
                                            <div style={{ color: "#64748b" }}>
                                                {lec.youtube_url ? (
                                                    <YoutubeIcon />
                                                ) : lec.video_file ? (
                                                    <VideoIcon />
                                                ) : lec.pdf_file ? (
                                                    <PdfIcon />
                                                ) : lec.content_type ===
                                                  "quiz" ? (
                                                    <QuizIcon />
                                                ) : lec.content_type ===
                                                  "assignment" ? (
                                                    <AssignmentIcon />
                                                ) : (
                                                    <VideoIcon />
                                                )}
                                            </div>
                                            <span>{lec.title}</span>
                                            <small>{lec.content_type}</small>
                                        </LectureInfo>
                                        <IconButton
                                            danger
                                            onClick={() =>
                                                handleDeleteContent(
                                                    lec.id,
                                                    section.id,
                                                )
                                            }
                                            title="Delete Content"
                                        >
                                            <TrashIcon />
                                        </IconButton>
                                    </LectureItem>
                                ))}
                                {section.contents.length === 0 && (
                                    <div
                                        style={{
                                            padding: "20px",
                                            textAlign: "center",
                                            color: "#94a3b8",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        No content added to this section yet.
                                    </div>
                                )}
                            </LectureList>
                        </Section>
                    ))}

                <SectionTitle>Add Section</SectionTitle>
                <StyledForm onSubmit={handleAddSection}>
                    <FormGroup>
                        <Input
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="Section Title"
                        />
                    </FormGroup>
                    <SubmitButton disabled={isSubmittingSection}>
                        Add Section
                    </SubmitButton>
                </StyledForm>

                <SectionTitle>Add Content</SectionTitle>
                <AddLectureForm onSubmit={handleAddContent}>
                    <FormGroup>
                        <Label>Choose Section</Label>
                        <Select
                            id="sectionId"
                            value={newContent.sectionId}
                            onChange={handleContentFormChange}
                            required
                        >
                            <option value="">Select Section</option>
                            {course &&
                                course.sections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title}
                                    </option>
                                ))}
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Title</Label>
                        <Input
                            id="title"
                            value={newContent.title}
                            onChange={handleContentFormChange}
                            required
                        />
                    </FormGroup>

                    {/* --- CONTENT TYPE SELECTOR --- */}
                    <FormGroup>
                        <Label>Content Type</Label>
                        <Select
                            value={contentType}
                            onChange={(e) => {
                                setContentType(e.target.value);
                                // Reset specific states
                                setNewContent((prev) => ({
                                    ...prev,
                                    video_file: null,
                                    pdf_file: null,
                                    youtube_url: "",
                                }));
                            }}
                        >
                            <option value="video">Upload Video</option>
                            <option value="youtube">YouTube URL</option>
                            <option value="pdf">Upload PDF</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                        </Select>
                    </FormGroup>

                    {/* --- DYNAMIC INPUTS --- */}
                    {contentType === "video" && (
                        <FormGroup>
                            <Label>Video File</Label>
                            <FileInput
                                type="file"
                                id="video_file"
                                accept="video/*"
                                onChange={handleContentFormChange}
                                required
                            />
                        </FormGroup>
                    )}
                    {contentType === "youtube" && (
                        <FormGroup>
                            <Label>YouTube URL</Label>
                            <Input
                                type="url"
                                id="youtube_url"
                                value={newContent.youtube_url}
                                onChange={handleContentFormChange}
                                required
                            />
                        </FormGroup>
                    )}
                    {contentType === "pdf" && (
                        <FormGroup>
                            <Label>PDF File</Label>
                            <FileInput
                                type="file"
                                id="pdf_file"
                                accept=".pdf"
                                onChange={handleContentFormChange}
                                required
                            />
                        </FormGroup>
                    )}
                    {contentType === "quiz" && (
                        <FormGroup>
                            <Label>Quiz Builder</Label>
                            <QuizCreator onDataChange={setQuizQuestions} />
                        </FormGroup>
                    )}
                    {contentType === "assignment" && (
                        <>
                            <FormGroup>
                                <Label>Instructions</Label>
                                <Textarea
                                    rows="4"
                                    value={newAssignment.instructions}
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            instructions: e.target.value,
                                        })
                                    }
                                    placeholder="Describe the task..."
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Total Marks</Label>
                                <Input
                                    type="number"
                                    value={newAssignment.total_marks}
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            total_marks: e.target.value,
                                        })
                                    }
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Attachment (Optional Resource)</Label>
                                <FileInput
                                    type="file"
                                    id="assignment_file"
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            attachment: e.target.files[0],
                                        })
                                    }
                                />
                            </FormGroup>
                        </>
                    )}

                    <SubmitButton disabled={isSubmittingContent}>
                        Add Content
                    </SubmitButton>
                </AddLectureForm>
            </CurriculumContainer>
        </>
    );
}

// --- Styled Components ---

const FormContainer = styled.div`
    max-width: 800px;
    margin: 40px auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;
const CurriculumContainer = styled(FormContainer)`
    background-color: #fdfdfd;
`;
const FormHeading = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 30px;
`;
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
const Label = styled.label`
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
`;
const Input = styled.input`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
`;
const Textarea = styled.textarea`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    min-height: 80px;
    font-family: inherit;
`;
const Select = styled.select`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
`;
const FileInput = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
`;
const ImagePreview = styled.img`
    max-width: 150px;
    margin-top: 10px;
    border-radius: 4px;
`;
const Row = styled.div`
    display: flex;
    gap: 20px;
`;
const SubmitButton = styled.button`
    padding: 14px 25px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    &:disabled {
        background-color: #a0c3ff;
    }
`;
const ErrorMessage = styled.p`
    color: #dc3545;
    background: #f8d7da;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
`;
const SuccessMessage = styled.p`
    color: #155724;
    background: #d4edda;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
`;
const LoadingIndicator = styled.div`
    padding: 20px;
    text-align: center;
    font-size: 1.2em;
    color: #555;
`;
const SectionTitle = styled.h3`
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-top: 30px;
    color: #333;
`;
const Section = styled.div`
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 25px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
    background: #f8fafc;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;

    span {
        font-weight: 600;
        color: #1e293b;
        font-size: 1rem;
    }
`;

const LectureList = styled.div`
    display: flex;
    flex-direction: column;
`;

const LectureItem = styled.div`
    padding: 12px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f8fafc;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const LectureInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    span {
        font-weight: 500;
        color: #334155;
        font-size: 0.95rem;
    }

    small {
        color: #64748b;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        text-transform: capitalize;
    }
`;

const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${(props) => (props.danger ? "#ef4444" : "#64748b")};
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: ${(props) => (props.danger ? "#fee2e2" : "#f1f5f9")};
        color: ${(props) => (props.danger ? "#dc2626" : "#475569")};
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const AddLectureForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 25px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fcfcfc;
`;

// retired

// Icons
const VideoIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
    </svg>
);

const YoutubeIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
);

const PdfIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
    </svg>
);

const QuizIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const AssignmentIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </svg>
);

const TrashIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </svg>
);

const BookIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
    </svg>
);
