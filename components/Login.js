import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/users/login", { username, password });
            // Store the token onLoginSuccess
            localStorage.setItem("token", data.token);
            // Notify parent component
            onLoginSuccess(data.token); 
        } catch (error) {
            console.error("Login error:", error.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;