import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post('/api/users/register', { username, password });
            console.log('User registered:', data);
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.status === 409) {
                setError('Username already taken');
            } else {
                setError('Registration failed. Please try again later.')
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <label>
                <p>Username:</p>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
                <p>Password:</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
                </button>
                {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default Register;