import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register({ onRegistrationComplete }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!username.trim()) {
            isValid = false;
            newErrors.username = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(username)) {
            isValid = false;
            newErrors.username = "Email is invalid";
        }

        if (!password.trim()) {
            isValid = false;
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
        isValid = false;
        newErrors.password = "Password must be at least 8 characters";
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // If the form is valid, register the user
        if (validateForm()) {
            setLoading(true);
            try {
                const { data } = await axios.post('/api/users/register', { username, password });
                console.log('User registered:', data);
                setLoading(false);
                alert("Registration successful! Redirecting to login...");
                onRegistrationComplete();
                setTimeout(() => navigate('/login'), 2000);            
            } catch (error) {
                setLoading(false);
                setErrors({ form: 'Registration failed. Please try again later.' });
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <label>
                <p>Email:</p>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    aria-describedby="usernameError"
                />
                {errors.username && <p id="usernameError" className="error">{errors.username}</p>}
            </label>
            <label>
                <p>Password:</p>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    aria-describedby="passwordError"
                />
                {errors.password && <p id="passwordError" className="error">{errors.password}</p>}
            </label>
            <label>
                <p>We will never sell your data</p>
            </label>
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
                </button>
                {errors.form && <p className="error">{errors.form}</p>}
        </form>
    );
}

export default Register;