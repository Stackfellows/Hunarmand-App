Walkthrough - Credits Update & Login Fix
I have completed the requested updates and fixed the login error.

Changes Made
Documentation
Updated 
README.md
 to include developer credits for Dev Asad.
Bug Fixes
Fixed a critical async issue in 
Login.jsx
. The 
login
 function was being called without await, causing the application to proceed before the authentication request finished.
Verification Results
README Update
Verified that 
README.md
 now displays:
Project developed by: Dev Asad
Portfolio: devasad.stackfellows.com
Email: 
devasad0278@gmail.com
Login Functionality
The 
handleSubmit
 function in 
Login.jsx
 now correctly awaits the 
login
 response.
This ensures that result.success is properly evaluated based on the backend response.
javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password); // Now correctly awaited
    if (result.success) {
        // ... navigation logic
    }
};

Comment
Ctrl+Alt+M
