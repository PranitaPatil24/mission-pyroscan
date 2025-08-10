import websocket
import requests
import base64
import datetime
import cv2

# WebSocket server URL (Laptop's IP)
WS_SERVER_URL = "ws://<your-laptop-ip>:3000"

# Snapshot server URL (Laptop's IP)
SNAPSHOT_SERVER_URL = "http://<your-laptop-ip>:3000/snapshot"

# Connect to WebSocket for video streaming
ws = websocket.WebSocket()
ws.connect(WS_SERVER_URL)

# Function to send video frame over WebSocket
def send_frame(image):
    _, buffer = cv2.imencode('.jpg', image)
    frame_data = base64.b64encode(buffer).decode('utf-8')
    ws.send(frame_data)

# Function to send snapshot when fever is detected
def send_snapshot(image, max_temp):
    _, img_encoded = cv2.imencode('.jpg', image)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    files = {'image': img_encoded.tobytes()}
    data = {'timestamp': timestamp, 'max_temp': max_temp}
    
    response = requests.post(SNAPSHOT_SERVER_URL, data=data, files=files)
    if response.status_code == 200:
        print(f"Snapshot sent successfully at {timestamp}. URL: {response.text}")
    else:
        print("Failed to send snapshot")

# Main loop to process the video stream and detect fever
def main():
    while True:
        data_array = get_thermal_image()
        image = process_image(data_array)
        
        # Stream the thermal frame to the server
        send_frame(image)
        
        # Check for fever detection
        max_overall_temp = np.max(data_array)
        if max_overall_temp >= 37.5:
            print("Fever Detected!")
            send_snapshot(image, max_overall_temp)
