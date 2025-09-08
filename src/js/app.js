// app.js

const video = document.getElementById('video');
const resultBox = document.getElementById('result-box');
const captureBtn = document.getElementById('captureBtn');

// Model URL constant
const MODEL_URL = '/models';

let faceMatcher = null;

// Initialize the application
async function init() {
    try {
        // Load all required models
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // O mais leve para detecção
            faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // Modelo de marcos faciais mais leve
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL) // Necessário para reconhecer as faces
        ]);

        console.log('Models loaded successfully');

        // Load reference images and create FaceMatcher
        const labeledFaceDescriptors = await loadLabeledImages();
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        console.log('Reference faces loaded and matcher created.');

        // Start the video automatically
        startVideo();

        // Add event listener to the capture button to trigger recognition
        captureBtn.addEventListener('click', recognizeFace);
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Function to load reference images and create labeled descriptors
async function loadLabeledImages() {
    // Update this array with the names of your image files (without extension)
    const labels = ['Filipe', 'Guilherme','Caua','Paola']; // Add more names as needed
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            // Assuming images are in 'images/reference-faces' and are .jpg
            const imgUrl = `images/reference-faces/${label}.jpg`;
            const img = await faceapi.fetchImage(imgUrl);
            const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceDescriptor();
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

// Function to perform face recognition on the current video frame
async function recognizeFace() {
    if (!faceMatcher) {
        console.log("Aguardando o faceMatcher ser inicializado.");
        return;
    }

    const displaySize = { width: video.width, height: video.height };
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceDescriptors();

    if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Encontra a maior detecção (rosto mais próximo/maior na tela)
        const largestDetection = resizedDetections.sort((a, b) => b.detection.box.area - a.detection.box.area)[0];

        if (largestDetection) {
            const bestMatch = faceMatcher.findBestMatch(largestDetection.descriptor);
            const name = bestMatch.label;
            const similarity = (1 - bestMatch.distance).toFixed(2);

            resultBox.style.display = 'block';
            resultBox.textContent = `Encontrado: ${name} (Similaridade: ${similarity})`;

            if (name === 'unknown') {
                resultBox.className = 'result-box unknown';
                resultBox.textContent = `Desconhecido (Similaridade: ${similarity})`;
            } else {
                resultBox.className = 'result-box found';
            }
        }
    } else {
        // Se nenhum rosto for detectado, mostra uma mensagem e oculta a caixa
        resultBox.style.display = 'block';
        resultBox.className = 'result-box unknown';
        resultBox.textContent = 'Nenhum rosto detectado.';
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);