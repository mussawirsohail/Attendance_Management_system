import os
import json
from groq import Groq
from schemas.schemas import AIParseResponse, AttendanceStatus
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def parse_attendance_with_ai(text: str) -> AIParseResponse:
    """
    Parse attendance information from natural language text using Groq AI
    """
    try:
        # Define the prompt for the AI
        prompt = f"""
        You are an attendance parsing assistant. Extract the following information from the given text:
        1. Student names (list of names)
        2. Attendance status (present, absent, or late)
        3. Date (if mentioned, otherwise return null)
        
        Return the result as a JSON object with the following structure:
        {{
          "students": ["student_name1", "student_name2", ...],
          "status": "present|absent|late",
          "date": "YYYY-MM-DD" or null
        }}
        
        Text to parse: "{text}"
        """
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-70b-8192",  # Using the specified model
            response_format={"type": "json_object"},  # Request JSON response
        )
        
        # Extract the response
        response_text = chat_completion.choices[0].message.content
        
        # Parse the JSON response
        parsed_data = json.loads(response_text)
        
        # Validate and convert the status to the enum
        status_value = parsed_data.get("status", "present").lower()
        if status_value not in ["present", "absent", "late"]:
            status_value = "present"  # Default to present if invalid
            
        status_enum = AttendanceStatus(status_value)
        
        # Handle date parsing
        date_str = parsed_data.get("date")
        parsed_date = None
        if date_str:
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                # If date format is invalid, use current date
                parsed_date = datetime.utcnow()
        else:
            # If no date provided, use current date
            parsed_date = datetime.utcnow()
        
        # Create and return the response object
        return AIParseResponse(
            students=parsed_data.get("students", []),
            status=status_enum,
            date=parsed_date
        )
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Error in AI parsing: {str(e)}")