import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../includes/UserProvider";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";
import styled from "styled-components";
import { toast } from "react-toastify";

function CreatContent() {
    const { id } = useParams();
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData || userData.role !== "instructor") {
            navigate("/");
        }
    }, [id]);

    const [errorMessage, setErrorMessage] = "";
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [image, setImage] = useState(null);
    let handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("youtube_url", url);
        if (file) {
            formData.append("pdf_file", file);
        }

        try {
            const response = await api.post(
                `course/create/metirial/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            setTitle("");
            setUrl("");
            if (document.getElementById("course-image-input")) {
                document.getElementById("course-image-input").value = null;
            }
            navigate("/");
        } catch (err) {
            const errorMessage =
                err.response?.data?.data ||
                err.response?.data?.detail ||
                err.message ||
                "Failed to uplload";
            setErrorMessage(errorMessage);
            toast.error(errorMessage);
        }
    };
    let handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <FormContainer>
            <FormHeading>upload Course data </FormHeading>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {/* {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>} */}

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
                    <Label htmlFor="course_image">Course youtub url</Label>
                    <FileInput
                        type="url"
                        id="course-image-input"
                        accept="url/*"
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="course_image">Course pdf </Label>
                    <FileInput
                        type="file"
                        id="course-image-input"
                        accept="url/*"
                        onChange={handleFileChange}
                    />
                </FormGroup>

                <SubmitButton type="submit">submit</SubmitButton>
            </StyledForm>
        </FormContainer>
    );
}

export default CreatContent;

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
