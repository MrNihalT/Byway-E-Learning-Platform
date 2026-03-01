import React, { useState } from "react";
import styled from "styled-components";
import api from "../../api";


const FormContainer = styled.div`
    max-width: 600px;
    margin: 20px auto;
    padding: 25px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
`;

const FormHeading = styled.h3`
    text-align: center;
    color: #333;
    margin-top: 0;
    margin-bottom: 25px;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
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
`;

const FileInput = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

const SubmitButton = styled.button`
    padding: 12px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    flex-grow: 1;

    &:disabled {
        background-color: #a0c3ff;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(SubmitButton)`
    background-color: #6c757d;
`;

const ErrorMessage = styled.p`
    color: #dc3545;
    font-size: 0.9rem;
    text-align: center;
`;

function CreateCategoryForm({ onCategoryAdded, onClose }) {
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !imageFile) {
            setError("Both name and image are required.");
            return;
        }

        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category_img", imageFile);

        try {
            const response = await api.post(
                "course/admin/categories/create/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            onCategoryAdded(response.data); 
        } catch (err) {
            console.error("Failed to create category", err.response);
            setError(err.response?.data?.data || "Failed to create category.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormHeading>Add New Category</FormHeading>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <StyledForm onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="cat_name">Category Name</Label>
                    <Input
                        type="text"
                        id="cat_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="cat_image">Category Image</Label>
                    <FileInput
                        type="file"
                        id="cat_image"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        required
                    />
                </FormGroup>
                <ButtonGroup>
                    <CancelButton
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Category"}
                    </SubmitButton>
                </ButtonGroup>
            </StyledForm>
        </FormContainer>
    );
}

export default CreateCategoryForm;
