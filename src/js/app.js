// app.js

const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const captureBtn = document.getElementById('captureBtn');

// Model URL constant
const MODEL_URL = '/models';

let faceMatcher = null;

// Initialize the application
async function init() {
    try {
        // Load all required models
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL) // <-- Load the required model
        ]);

        console.log('Models loaded successfully');

        // Load reference images and create FaceMatcher
        const labeledFaceDescriptors = await loadLabeledImages();
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        console.log('Reference faces loaded and matcher created.');

        // Add event listeners
        startBtn.addEventListener('click', startVideo);
        // The capture button is not needed for real-time recognition, but we can keep it.
        captureBtn.addEventListener('click', () => console.log('Capture button clicked'));
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Function to load reference images and create labeled descriptors
async function loadLabeledImages() {
    // Update this array with the names of your image files (without extension)
    const labels = ['Filipe', 'Guilherme', 'Theo']; // Add more names as needed
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            // Assuming images are in 'images/reference-faces' and are .jpg
            const imgUrl = `images/reference-faces/${label}.jpg`;
            const img = await faceapi.fetchImage(imgUrl);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detections) {
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
}

// Run face detection when video is playing
video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        if (!faceMatcher) return;
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
            drawBox.draw(canvas);
        });
    }, 200);
});

// Start the application
document.addEventListener('DOMContentLoaded', init);