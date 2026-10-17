from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse

from .sentinal_plugin import (
    login_failed,
    login_success
)


app = FastAPI(
    title="Sentinal Test Web Application"
)


# =====================================================
# DEMO USER
# =====================================================

DEMO_USERNAME = "admin"
DEMO_PASSWORD = "admin123"


# =====================================================
# LOGIN PAGE
# =====================================================

@app.get("/", response_class=HTMLResponse)
def home():

    return """
    <!DOCTYPE html>
    <html>

    <head>

        <title>Test Web Application</title>

        <style>

            body {
                font-family: Arial;
                background: #111827;
                color: white;

                display: flex;
                justify-content: center;
                align-items: center;

                height: 100vh;
            }

            .login-box {

                width: 350px;

                padding: 30px;

                background: #1f2937;

                border-radius: 12px;

                box-shadow:
                    0 10px 30px rgba(0,0,0,0.4);
            }

            h1 {
                text-align: center;
            }

            input {

                width: 100%;

                padding: 12px;

                margin-top: 10px;

                margin-bottom: 15px;

                box-sizing: border-box;

                border-radius: 6px;

                border: none;
            }

            button {

                width: 100%;

                padding: 12px;

                background: #2563eb;

                color: white;

                border: none;

                border-radius: 6px;

                cursor: pointer;
            }

            button:hover {

                background: #1d4ed8;
            }

        </style>

    </head>


    <body>

        <div class="login-box">

            <h1>🔐 Test Web App</h1>

            <p>
                Connected to Sentinal AI
            </p>

            <form method="post" action="/login">

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                >

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                >

                <button type="submit">
                    Login
                </button>

            </form>

        </div>

    </body>

    </html>
    """


# =====================================================
# LOGIN
# =====================================================

@app.post("/login", response_class=HTMLResponse)
def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):

    # Get visitor IP

    client_ip = request.client.host


    # -------------------------------------------------
    # SUCCESSFUL LOGIN
    # -------------------------------------------------

    if (
        username == DEMO_USERNAME
        and password == DEMO_PASSWORD
    ):

        # Tell Sentinal

        result = login_success(
            username=username,
            source_ip=client_ip
        )


        return f"""
        <h1>✅ Login Successful</h1>

        <p>
            Welcome, {username}
        </p>

        <p>
            Sentinal event sent.
        </p>

        <a href="/">
            Back to login
        </a>
        """


    # -------------------------------------------------
    # FAILED LOGIN
    # -------------------------------------------------

    result = login_failed(
        username=username,
        source_ip=client_ip
    )


    return f"""
    <h1>❌ Login Failed</h1>

    <p>
        Invalid username or password.
    </p>

    <p>
        Sentinal security event sent.
    </p>

    <a href="/">
        Try again
    </a>
    """