import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup",
        {
          email,
          password,
        }
      );
      console.log(response.data);
      // store token if exists
      localStorage.setItem("token", response.data.token);//store data in browser and permanet after refresh 
      navigate("/login")

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4">
      
      <input
        type="text"
        placeholder="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2"
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}// e is event it is object and passed given by react ✅ an event handler React passes the event object (e) to your function
        className="border p-2"//React always creates an event when interaction happens
                               //👉 But you only get access to it if you accept it onChange={() => setPassword(9)}
      />
      <button
        onClick={handleSignin}
        className="bg-blue-500 text-white p-2"
      >
        signin
      </button>
    </div>
  );
}