import React, { useState } from 'react';
import axios from 'axios'; // For sending the HTTP request

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent form from causing a page reload

        // Validate input...
        // Sanitize input...

        try {
            const response = await axios.post('/register', { username, password });
            console.log(response.data);
            // Navigate to login page or dashboard upon successful registration
        } catch (error) {
            console.error(error);
            // Handle errors (e.g., display error message)
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <label htmlFor="username">Username:</label>
            <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Password:</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Register</button>
        </form>
    );
}

export default Register;