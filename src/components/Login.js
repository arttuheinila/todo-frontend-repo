import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous errors
        setError("");
        try {
            const { data } = await axios.post("/api/users/login", { username, password });
            // Store the token onLoginSuccess
            localStorage.setItem("token", data.token);
            // Notify parent component
            onLoginSuccess(data.token); 
        } catch (error) {
            console.error("Login error:", error.response.data);
            setError("Invalid login attempt. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <label>
                <p>Email:</p>
                <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
                <p>Password:</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit">Login</button>
            {error && <e className="error">{error}</e>}
        </form>
    );
}

export default Login;