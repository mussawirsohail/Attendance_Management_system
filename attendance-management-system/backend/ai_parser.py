import os
import json
from groq import Groq
from schemas import AIParseResponse, AttendanceStatus
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")

# Check if API key is available
if not api_key:
    print("Warning: GROQ_API_KEY environment variable not set. AI parsing will not work.")
    client = None
else:
    client = Groq(api_key=api_key)


def parse_attendance_command(command: str) -> AIParseResponse:
    """
    Parse attendance information from natural language command using Groq AI

    Args:
        command (str): Natural language attendance command

    Returns:
        AIParseResponse: Parsed attendance information
    """
    # Check if client is available
    if client is None:
        print("Using mock AI parser since GROQ_API_KEY is not set")
        return mock_parse_attendance_command(command)

    try:
        # Define the prompt for the AI
        prompt = f"""
        You are an attendance parsing assistant. Extract the following information from the given text:
        1. Student names (list of names)
        2. Attendance status (Present, Absent, or Late)
        3. Date (if mentioned, otherwise return null)

        Return the result as a JSON object with the following structure:
        {{
          "students": ["student_name1", "student_name2", ...],
          "status": "present|absent|late",
          "date": "YYYY-MM-DD" or null
        }}

        Text to parse: "{command}"

        Important: Only return the JSON object, nothing else.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",  # Using a currently supported model
            response_format={"type": "json_object"},  # Request JSON response
        )

        # Extract the response
        response_text = chat_completion.choices[0].message.content
        print(f"AI Response: {response_text}")  # Debug print

        # Parse the JSON response
        parsed_data = json.loads(response_text)

        # Validate and convert the status to the enum
        status_value = parsed_data.get("status", "present").lower()
        if status_value not in ["present", "absent", "late"]:
            status_value = "present"  # Default to present if invalid

        # Map lowercase values to the enum's capitalized format
        status_mapping = {
            "present": "Present",
            "absent": "Absent", 
            "late": "Late"
        }
        
        status_enum = AttendanceStatus(status_mapping[status_value])

        # Handle date parsing
        date_str = parsed_data.get("date")
        parsed_date = datetime.utcnow()  # Default to current date
        if date_str:
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                # If date format is invalid, use current date
                parsed_date = datetime.utcnow()

        # Create and return the response object
        return AIParseResponse(
            students=parsed_data.get("students", []),
            status=status_enum,
            date=parsed_date
        )

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text that failed: {response_text}")
        # Fall back to mock parser if JSON parsing fails
        return mock_parse_attendance_command(command)
    except Exception as e:
        print(f"General error in AI parsing: {e}")
        # Fall back to mock parser if any other error occurs
        return mock_parse_attendance_command(command)


def mock_parse_attendance_command(command: str) -> AIParseResponse:
    """
    Mock implementation of AI parsing for testing purposes
    """
    import re
    from datetime import datetime

    # Convert command to lowercase for easier processing
    lower_command = command.lower()

    # Determine status based on keywords
    if "absent" in lower_command:
        status = AttendanceStatus.absent
    elif "late" in lower_command:
        status = AttendanceStatus.late
    else:
        status = AttendanceStatus.present  # default to present

    # Extract student names using regex patterns
    # This is a simplified extraction - in a real implementation, you'd have a database of student names to match against
    student_names = []

    # Look for common patterns like "X is Y", "X and Y are Z", etc.
    # This is a basic implementation - a real one would be more sophisticated
    if "and" in command:
        # Split by "and" to get multiple names
        parts = command.split(" and ")
        for part in parts:
            # Extract name before "is" or similar indicators
            name_match = re.search(r'^([A-Za-z]+)', part.strip())
            if name_match:
                student_names.append(name_match.group(1))
    else:
        # Single name pattern
        name_match = re.search(r'^([A-Za-z]+)', command.strip())
        if name_match:
            student_names.append(name_match.group(1))

    # If no names found, try other patterns
    if not student_names:
        # Look for names followed by "is" or "are"
        name_matches = re.findall(r'([A-Z][a-z]+)(?:\s+(?:is|are))', command)
        student_names.extend(name_matches)

    # If still no names found, try to extract any capitalized words
    if not student_names:
        capitalized_words = re.findall(r'\b[A-Z][a-z]+\b', command)
        # Filter out common words that might not be names
        potential_names = [word for word in capitalized_words
                          if word.lower() not in ['the', 'and', 'are', 'was', 'were', 'is', 'am', 'be', 'to', 'at', 'on']]
        student_names.extend(potential_names)

    # Remove duplicates while preserving order
    student_names = list(dict.fromkeys(student_names))

    # If still no names, add a default
    if not student_names:
        student_names = ["Unknown"]

    # Extract date from the command
    # Patterns for dates: "on DD MMM YYYY", "on MMM DD YYYY", "on DD/MM/YYYY", "on YYYY-MM-DD", etc.
    date_pattern1 = r'on\s+(\d{1,2})\s+([a-zA-Z]{3,9})\s+(\d{4})'  # "on 6 Feb 2026"
    date_pattern2 = r'on\s+([a-zA-Z]{3,9})\s+(\d{1,2})\s+,?\s*(\d{4})'  # "on February 6, 2026"
    date_pattern3 = r'on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})'  # "on 06/02/2026" or "on 06-02-2026"
    date_pattern4 = r'on\s+(\d{4}-\d{1,2}-\d{1,2})'  # "on 2026-02-06"

    date_match = None
    parsed_date = None
    
    # Try different date patterns
    match1 = re.search(date_pattern1, command, re.IGNORECASE)
    if match1:
        day, month, year = match1.groups()
        try:
            # Convert month name to number
            month_num = datetime.strptime(month[:3], '%b').month
            parsed_date = datetime(int(year), month_num, int(day))
        except ValueError:
            pass  # Invalid date, continue to try other patterns

    if not parsed_date:
        match2 = re.search(date_pattern2, command, re.IGNORECASE)
        if match2:
            month, day, year = match2.groups()
            try:
                # Convert month name to number
                month_num = datetime.strptime(month[:3], '%b').month
                parsed_date = datetime(int(year), month_num, int(day))
            except ValueError:
                pass  # Invalid date, continue to try other patterns

    if not parsed_date:
        match3 = re.search(date_pattern3, command, re.IGNORECASE)
        if match3:
            date_str = match3.group(1)
            try:
                # Try to parse different formats
                if '/' in date_str:
                    parsed_date = datetime.strptime(date_str, '%m/%d/%Y')
                elif '-' in date_str:
                    parsed_date = datetime.strptime(date_str, '%m-%d-%Y')
            except ValueError:
                try:
                    # Try DD/MM/YYYY or DD-MM-YYYY
                    if '/' in date_str:
                        parsed_date = datetime.strptime(date_str, '%d/%m/%Y')
                    elif '-' in date_str:
                        parsed_date = datetime.strptime(date_str, '%d-%m-%Y')
                except ValueError:
                    pass  # Invalid date format

    if not parsed_date:
        match4 = re.search(date_pattern4, command, re.IGNORECASE)
        if match4:
            date_str = match4.group(1)
            try:
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                pass  # Invalid date format

    # If no date was extracted, use current date
    if not parsed_date:
        parsed_date = datetime.utcnow()

    return AIParseResponse(
        students=student_names,
        status=status,
        date=parsed_date
    )