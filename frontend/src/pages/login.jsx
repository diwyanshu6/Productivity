import axios from "axios";
import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        }
      );

      console.log(res.data);

      // store token
      localStorage.setItem("token", res.data.token);

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4">

      <input
        type="email"
        placeholder="email"
        required
        value={email}
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}  //  FIXED
      />

      <input
        type="password"
        placeholder="password"
        required
        value={password}
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2"
        onClick={handleLogin}
      >
        login
      </button>

    </div>
  );
}

export default Login;