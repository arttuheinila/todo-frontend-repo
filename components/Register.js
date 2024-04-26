import React, { usesState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";


const API_BASE_URL = process.env.REACT_APP_API_URL;

console.log('REGISTER API_BASE_URL:', API_BASE_URL);

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`TRYING TO REGISTER USER TO ${API_BASE_URL}`, data);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, { username, password });
            console.log('User registered:', data);
            // Redirect user to login page
            history.push("/login");
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