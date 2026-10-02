import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase/config";
import "./Register.css";

function Register({
  selectedField,
  selectedCareer,
  onBack,
  onContinue,
  onLogin,
  onUserCreated,
}) {
    const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const handleRegister = async (event) => {
  event.preventDefault();

  setError("");

  if (!name.trim()) {
    setError("Please enter your full name.");
    return;
  }

  if (!email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

const user = userCredential.user;


console.log("Account created:", user.uid);
onUserCreated(user.uid);

await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  name: name.trim(),
  email: user.email,
  field: selectedField?.title || "",
  career: selectedCareer?.title || "",
  careerDescription: selectedCareer?.description || "",
  createdAt: serverTimestamp(),
});

console.log("Profile saved to Firestore.");

alert("Account created successfully! 🎉");
onContinue();
  } catch (error) {
    console.error("Registration error:", error);

    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <main className="register-page">

      {/* Left visual section */}
      <section className="register-visual">

        <button
          className="register-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="visual-cloud visual-cloud-one">
          ☁️
        </div>

        <div className="visual-cloud visual-cloud-two">
          ☁️
        </div>

        <div className="visual-plane">
          ✈️
        </div>

        <div className="visual-content">

          <p className="visual-small-text">
            YOUR JOURNEY STARTS HERE
          </p>

          <h1>
            Ready for
            <br />
            takeoff?
          </h1>

          <p>
            You've chosen your destination.
            <br />
            Now let's create your boarding pass.
          </p>

          <div className="selected-destination">

            <span className="selected-icon">
              {selectedCareer?.icon}
            </span>

            <div>
              <span className="selected-label">
                YOUR DESTINATION
              </span>

              <strong>
  {selectedCareer?.title}
</strong>

<small>
  {selectedField?.title}
</small>

<p className="selected-description">
  {selectedCareer?.description}
</p>
            </div>

          </div>

        </div>

      </section>


      {/* Right registration section */}
      <section className="register-form-section">

        <div className="register-form-container">

          <p className="register-step">
            STEP 3 · CREATE YOUR BOARDING PASS
          </p>

          <h2>
            Create your account
          </h2>

          <p className="register-description">
            Your journey is waiting. Let's get your boarding pass ready.
          </p>

          <form onSubmit={handleRegister}>

            <div className="register-input-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
  id="name"
  type="text"
  placeholder="Enter your full name"
  value={name}
  onChange={(event) => setName(event.target.value)}
/>

            </div>


            <div className="register-input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
  id="email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>

            </div>


            <div className="register-input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
  id="password"
  type="password"
  placeholder="Create a password"
  value={password}
  onChange={(event) => setPassword(event.target.value)}
/>

            </div>


            <div className="register-input-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
  id="confirmPassword"
  type="password"
  placeholder="Re-enter your password"
  value={confirmPassword}
  onChange={(event) =>
    setConfirmPassword(event.target.value)
  }
/>

            </div>

{error && (
  <p className="register-error">
    {error}
  </p>
)}
            <button
  type="submit"
  className="register-submit-button"
  disabled={loading}
>
  {loading
    ? "Preparing Your Boarding Pass..."
    : "Create Your Boarding Pass →"}
</button>

          </form>

          <p className="login-link">
            Already have an account?
           <button
  type="button"
  onClick={onLogin}
>
  Login
</button>
          </p>

        </div>

      </section>

    </main>
  );
}

export default Register;