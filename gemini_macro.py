import pyautogui
import time
import os

# Ensure we're reading from the same directory as the script
script_dir = os.path.dirname(os.path.abspath(__file__))
topics_file = os.path.join(script_dir, 'topics.txt')

try:
    with open(topics_file, 'r', encoding='utf-8') as file:
        # Read lines and remove empty ones
        topics = [line.strip() for line in file.readlines() if line.strip()]
except FileNotFoundError:
    print(f"Error: Could not find '{topics_file}'.")
    exit()

if not topics:
    print("The topics.txt file is empty. Please add some topics!")
    exit()

# Set how long to wait for Gemini to finish generating (in seconds)
WAIT_TIME = 120

print("Script starting!")
print("QUICK: Click on the Gemini chat input box in your browser!")
print("You have 5 seconds to switch to your browser...")

# Give you 5 seconds to click on the browser's input text box
time.sleep(6)

for topic in topics:
    prompt = f" {topic}"
    
    # Type the prompt as if you were typing on the keyboard
    pyautogui.write(prompt, interval=0.02)
    
    # Press Enter to send the message
    pyautogui.press('enter')
    
    print(f"Sent topic: '{topic}'. Waiting {WAIT_TIME} seconds for generation...")
    
    # Wait for Gemini to finish generating before sending the next one
    time.sleep(WAIT_TIME)

print("All topics have been processed!")
