

def clean_ai_json(text):
    """
    Cleans the AI response to ensure it is valid JSON.
    Removes Markdown formatting and finds the JSON object/array.
    """
    
    text = text.replace("```json", "").replace("```", "")
    
    
    start_array = text.find('[')
    start_object = text.find('{')
    
    if start_array != -1 and (start_object == -1 or start_array < start_object):
        start = start_array
        end = text.rfind(']') + 1
    else:
        start = start_object
        end = text.rfind('}') + 1
    
    if start != -1 and end != 0:
        text = text[start:end]
        
    return text