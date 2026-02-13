@echo off
REM Script to start the backend server on Windows

REM Activate virtual environment if it exists
if exist venv (
    call venv\Scripts\activate.bat
) else if exist env (
    call env\Scripts\activate.bat
)

REM Install dependencies
pip install -r requirements.txt

REM Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause