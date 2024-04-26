import React, { usesState } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, { username, password });
            console.log('User registered:', data);
            // Redirect user to login page
            history.push(`${API_BASE_URL}/login`);
        } catch (error) {
            console.error('Registration error:', error.response.data)
        }
    }

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
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;