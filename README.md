# Facial Recognition Web Application

This project is a facial recognition web application built using vanilla JavaScript. It utilizes the face-api.js library to detect and recognize faces from a live webcam feed. The application compares the detected faces against a set of reference images stored in the project.

## Project Structure

```
facial-recognition-app
├── src
│   ├── index.html          # Main HTML document
│   ├── styles
│   │   └── style.css       # Styles for the web application
│   ├── js
│   │   ├── app.js          # Main JavaScript file
│   │   └── face-detection.js # Face detection and recognition logic
│   ├── models
│   │   └── face-api-models  # Pre-trained models for face-api.js
│   └── images
│       └── reference-faces  # Reference images for comparison
├── package.json             # npm configuration file
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd facial-recognition-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Open `src/index.html` in a web browser** to run the application.

## Usage

- Allow access to your webcam when prompted.
- The application will detect faces from the webcam feed and compare them against the reference images.
- Ensure that reference images are placed in the `src/images/reference-faces` directory.

## License

This project is licensed under the MIT License.