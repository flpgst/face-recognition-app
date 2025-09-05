// face-detection.js

// Load the face-api.js library
async function loadModels() {
    const MODEL_URL = '/models/face-api-models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

// Detect faces from the webcam feed
async function detectFaces(videoElement) {
    const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    return detections;
}

// Compare detected faces against reference images
async function compareFaces(detections, referenceImages) {
    const labeledDescriptors = await loadReferenceImages(referenceImages);
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
    return results;
}

// Load reference images and create labeled descriptors
async function loadReferenceImages(referenceImages) {
    const labeledDescriptors = [];
    for (const img of referenceImages) {
        const image = await faceapi.fetchImage(img);
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
        labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(img.name, [detections.descriptor]));
    }
    return labeledDescriptors;
}