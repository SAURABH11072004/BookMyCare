document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.querySelector(".login-btn");
    const signupBtn = document.querySelector(".signup-btn");
    
    loginBtn.addEventListener("click", function() {
        alert("Redirecting to login page...");
    });
    
    signupBtn.addEventListener("click", function() {
        alert("Sign-up successful!");
    });
});
