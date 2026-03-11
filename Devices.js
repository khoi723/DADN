// init firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, child, onValue } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
const config = { databaseURL: 'https://dadn252-default-rtdb.asia-southeast1.firebasedatabase.app/' };
initializeApp(config);
const dbRef = ref(getDatabase());

// Track warning trigger states
let hasTriggeredOverMoistureWarning = false;
let hasShownWateringNeeded = false;

// Function to check moisture against automatic mode settings
function checkMoistureCondition(moistureValue) {
    const onCondition = document.getElementById('onCondition')?.value || 'above';
    const onValue = parseFloat(document.getElementById('onValue')?.value || 40);
    const offCondition = document.getElementById('offCondition')?.value || 'below';
    const offValue = parseFloat(document.getElementById('offValue')?.value || 55);
    const moisture = parseFloat(moistureValue);
    
    // Check if moisture violates turn on condition (need watering)
    const needsWatering = onCondition === 'above' ? moisture < onValue : moisture > onValue;
    
    // Check if moisture violates turn off condition (over-moisture)
    const isOverMoisture = offCondition === 'above' ? moisture < offValue : moisture > offValue;
    
    return { needsWatering, isOverMoisture };
}

// Function to update and show icon or warning based on moisture status
export function updateMoistureWarning(moistureValue) {
    const { needsWatering, isOverMoisture } = checkMoistureCondition(moistureValue);
    
    if (needsWatering && !isOverMoisture) {
        // Moisture is low - show watering needed icon
        if (!hasShownWateringNeeded) {
            if (window.showWateringNeededIcon) window.showWateringNeededIcon(moistureValue);
            hasShownWateringNeeded = true;
        }
        // Hide warning if it was showing
        if (hasTriggeredOverMoistureWarning) {
            if (window.closeMoistureWarning) window.closeMoistureWarning();
            hasTriggeredOverMoistureWarning = false;
        }
    } else if (isOverMoisture) {
        // Moisture is too high - show warning popup
        if (!hasTriggeredOverMoistureWarning) {
            const offCondition = document.getElementById('offCondition')?.value || 'below';
            const offValue = document.getElementById('offValue')?.value || '55';
            const warningMessage = `Moisture is too high (${offCondition} ${offValue}%)`;
            if (window.showMoistureWarning) window.showMoistureWarning(moistureValue, warningMessage);
            hasTriggeredOverMoistureWarning = true;
        }
        // Hide icon if it was showing
        if (hasShownWateringNeeded) {
            if (window.hideWateringNeededIcon) window.hideWateringNeededIcon();
            hasShownWateringNeeded = false;
        }
    } else {
        // Moisture is in safe range
        if (hasTriggeredOverMoistureWarning) {
            if (window.closeMoistureWarning) window.closeMoistureWarning();
            hasTriggeredOverMoistureWarning = false;
        }
        if (hasShownWateringNeeded) {
            if (window.hideWateringNeededIcon) window.hideWateringNeededIcon();
            hasShownWateringNeeded = false;
        }
    }
}

// event-handler methods
export function page_Load() {
    onValue(child(dbRef, 'DHT11'), (snapshot) => {
    snapshot.forEach((child) => {
        if (child.key === 'temp') {
        document.getElementById('lblTemp').innerText = child.val();
        }
        if (child.key === 'humi') {
        document.getElementById('lblHumidity').innerText = child.val();
        }
    });
    });
    onValue(child(dbRef, 'SOIL'), (snapshot) => {
    snapshot.forEach((child) => {
        if (child.key === 'moist') {
        const moistureValue = child.val();
        document.getElementById('lblMoisture').innerText = moistureValue;
        // Check moisture condition whenever value updates
        updateMoistureWarning(moistureValue);
        }
    });
    });
}

// Make functions accessible globally
window.page_Load = page_Load;
window.updateMoistureWarning = updateMoistureWarning;