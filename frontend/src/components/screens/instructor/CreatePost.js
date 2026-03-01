import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { toast } from "react-toastify";

function CreateCourse() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [category, setCategories] = useState([]);

    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [offerPercentage, setOfferPercentage] = useState(0);
    const [courseImage, setCourseImage] = useState(null);
    const [totalTime, setTotalTime] = useState("");
    const [difficulty, setDifficulty] = useState("BEGINNER");
    const [categoryName, setCategoryName] = useState("");
    const [isDraft, setIsDraft] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Redirect if user is not an instructor
    useEffect(() => {
        if (userData && userData.role !== "instructor") {
            navigate("/");
        }
    }, [userData, navigate]);

    useEffect(() => {
        api.get("course/categories/")
            .then((res) => {
                setCategories(res.data);
                console.log("category" + JSON.stringify(res.data));
            })
            .catch((err) => {
                console.log("data" + err);
            });
    }, []);
    console.log("data" + JSON.stringify(category));

    const handleImageChange = (e) => {
        setCourseImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("short_description", shortDescription);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("offer_percentage", offerPercentage);
        if (courseImage) {
            formData.append("course_image", courseImage);
        }
        formData.append("total_time", totalTime);
        formData.append("difficulty", difficulty);
        formData.append("category_name", categoryName);
        formData.append("is_draft", isDraft);

        try {
            const response = await api.post(
                "course/courses/create/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            toast.success(`Course created! ID: ${response.data.id}`);
            const newCourseId = response.data.id;
            setSuccessMessage(
                `Course "${response.data.title}" created successfully!`,
            );

            setTitle("");
            setShortDescription("");
            setDescription("");
            setPrice("");
            setOfferPercentage(0);
            setCourseImage(null);
            setTotalTime("");
            setDifficulty("BEGINNER");
            setCategoryName("");
            setIsDraft(false);
            if (document.getElementById("course-image-input")) {
                document.getElementById("course-image-input").value = null;
            }
            navigate(`/instructor/edit-course/${newCourseId}`);
        } catch (err) {
            console.error("Course creation error:", err.response || err);

            const errorMessage =
                err.response?.data?.data ||
                err.response?.data?.detail ||
                err.message ||
                "Failed to create course. Please check your input.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData || userData.role !== "instructor") {
        return <LoadingIndicator>Loading or Unauthorized...</LoadingIndicator>;
    }

    return (
        <>
            <Header />
            <FormContainer>
                <FormHeading>Create New Course</FormHeading>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                )}

                <StyledForm onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="short_description">
                            Short Description
                        </Label>
                        <Textarea
                            id="short_description"
                            value={shortDescription}
                            onChange={(e) =>
                                setShortDescription(e.target.value)
                            }
                            rows="3"
                            maxLength="500" // Match Django model
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="description">Full Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="6"
                            required
                        />
                    </FormGroup>

                    <Row>
                        <FormGroup>
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                step="0.01"
                                min="0"
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="offer_percentage">Offer (%)</Label>
                            <Input
                                type="number"
                                id="offer_percentage"
                                value={offerPercentage}
                                onChange={(e) =>
                                    setOfferPercentage(e.target.value)
                                }
                                min="0"
                                max="100"
                            />
                        </FormGroup>
                    </Row>

                    <FormGroup>
                        <Label htmlFor="course_image">Course Image</Label>
                        <FileInput
                            type="file"
                            id="course-image-input"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                        />

                        {courseImage && (
                            <ImagePreview
                                src={URL.createObjectURL(courseImage)}
                                alt="Preview"
                            />
                        )}
                    </FormGroup>

                    <Row>
                        <FormGroup>
                            <Label htmlFor="total_time">
                                Total Time (e.g., 5 hours)
                            </Label>
                            <Input
                                type="text"
                                id="total_time"
                                value={totalTime}
                                onChange={(e) => setTotalTime(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                required
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
                        <Label htmlFor="category_name">Select Category</Label>
                        <Select
                            id="category_name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            style={{ marginBottom: "20px" }}
                        >
                            <option value="">Select Category</option>
                            {category.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </Select>
                        <Label htmlFor="new_category_name">
                            Create New Category
                        </Label>
                        <Input
                            type="text"
                            id="new_category_name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="e.g., Web Development (Will be created if new)"
                        />
                    </FormGroup>

                    <CheckboxGroup>
                        <CheckboxInput
                            type="checkbox"
                            id="is_draft"
                            checked={isDraft}
                            onChange={(e) => setIsDraft(e.target.checked)}
                        />
                        <Label htmlFor="is_draft" style={{ marginBottom: 0 }}>
                            Save as Draft
                        </Label>
                    </CheckboxGroup>

                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Course"}
                    </SubmitButton>
                </StyledForm>
            </FormContainer>
        </>
    );
}

export default CreateCourse;

// --- Styled Components ---

const FormContainer = styled.div`
    max-width: 800px;
    margin: 40px auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        padding: 20px;
        margin: 20px;
    }
`;

const FormHeading = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-weight: 600;
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
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Textarea = styled.textarea`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit; /* Ensure textarea uses the same font */
    resize: vertical; /* Allow vertical resizing */
    min-height: 80px;
    transition: border-color 0.2s ease-in-out;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Select = styled.select`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    background-color: white; /* Ensure select background is white */
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const FileInput = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;

    /* Basic styling for the file input button */
    &::file-selector-button {
        padding: 8px 15px;
        border-radius: 4px;
        border: none;
        background-color: #eee;
        cursor: pointer;
        margin-right: 10px;
        transition: background-color 0.2s;
        &:hover {
            background-color: #ddd;
        }
    }
`;

const ImagePreview = styled.img`
    max-width: 150px;
    max-height: 150px;
    margin-top: 10px;
    border-radius: 4px;
    border: 1px solid #eee;
`;

const Row = styled.div`
    display: flex;
    gap: 20px;

    /* Make columns stack on smaller screens */
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 20px; /* Keep gap consistent */
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 5px; /* Add some space above */
`;

const CheckboxInput = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;
`;

const SubmitButton = styled.button`
    padding: 14px 25px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    margin-top: 15px; /* Add space above the button */

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #a0c3ff;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    color: #dc3545; /* Bootstrap danger color */
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px 15px;
    border-radius: 6px;
    margin-bottom: 20px; /* Add space below */
    font-size: 0.9rem;
    text-align: center;
`;

const SuccessMessage = styled.p`
    color: #155724; /* Bootstrap success color */
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 10px 15px;
    border-radius: 6px;
    margin-bottom: 20px; /* Add space below */
    font-size: 0.9rem;
    text-align: center;
`;

const LoadingIndicator = styled.div`
    padding: 20px;
    text-align: center;
    font-size: 1.2em;
    color: #555;
`;
