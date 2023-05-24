// Elements
const measurementModal = document.querySelector(".measurement-modal-section");
const formContainer = document.querySelector(
    ".measurement-modal-form-container"
);
const loadingContainer = document.querySelector(
    ".measurement-modal-loading-container"
);
const resultContainer = document.querySelector(
    ".measurement-modal-result-container"
);
const sizeMeasurementForm = document.querySelector("#shirtSizeForm");

// Constants
const collarCoefficients = [-0.13417252, 0.84135936, 0.05379397, 0.23244605];
const collarIntercept = 15.623076923076923;
const fitCoefficients = [
    [0.25624752, -0.6396882, -0.50761855, -0.51741834],
    [0.36603087, -0.32376937, 0.25571718, -0.64658506],
    [-0.62227839, 0.96345758, 0.25190137, 1.1640034],
];
const fitIntercepts = [0.00475587, 0.2668346, -0.27159047];
const featureMeans = [58.52307692, 177.53846154, 32.78461538, 34.75384615];
const featureStdDevs = [2.5243899, 30.74864696, 9.24286387, 4.16590841];

// Values
let fitValues = [];
let maxIndex = 0;
let fitLabels = [];
let collarSize = 0;
let roundedCollarSize = 0;
let fitValue = "";
let sleeveLength = 0;
let bmiFit = "";
let recommendation = "";

// Calculate Collar Size
function calculateCollarSize(heightFeet, heightInches, weight, age, waist) {
    const heightInInches = parseInt(heightFeet) * 12 + parseInt(heightInches);

    // Scale input features
    const scaledHeight = (heightInInches - featureMeans[0]) / featureStdDevs[0];
    const scaledWeight = (weight - featureMeans[1]) / featureStdDevs[1];
    const scaledAge = (age - featureMeans[2]) / featureStdDevs[2];
    const scaledWaist = (waist - featureMeans[3]) / featureStdDevs[3];

    // Collar size prediction
    collarSize =
        collarCoefficients[0] * scaledHeight +
        collarCoefficients[1] * scaledWeight +
        collarCoefficients[2] * scaledAge +
        collarCoefficients[3] * scaledWaist +
        collarIntercept;
    roundedCollarSize = Math.ceil(collarSize * 2) / 2;

    // Fit prediction
    const extraSlim =
        fitCoefficients[0][0] * scaledHeight +
        fitCoefficients[0][1] * scaledWeight +
        fitCoefficients[0][2] * scaledAge +
        fitCoefficients[0][3] * scaledWaist +
        fitIntercepts[0];
    const slim =
        fitCoefficients[1][0] * scaledHeight +
        fitCoefficients[1][1] * scaledWeight +
        fitCoefficients[1][2] * scaledAge +
        fitCoefficients[1][3] * scaledWaist +
        fitIntercepts[1];
    const classic =
        fitCoefficients[2][0] * scaledHeight +
        fitCoefficients[2][1] * scaledWeight +
        fitCoefficients[2][2] * scaledAge +
        fitCoefficients[2][3] * scaledWaist +
        fitIntercepts[2];

    fitValues = [extraSlim, slim, classic];
    maxIndex = fitValues.indexOf(Math.max(...fitValues));
    fitLabels = ["Extra Slim", "Slim", "Classic"];

    fitValue = fitLabels[maxIndex];
}

// BMI Fit
function calculateBMIFit(heightFeet, heightInches, weight, age, waist) {
    const totalHeightInches = parseInt(heightFeet) * 12 + parseInt(heightInches);
    const weightKilograms = weight * 0.4536;
    const heightMeters = totalHeightInches * 0.0254;
    const bmi = weightKilograms / (heightMeters * heightMeters);


    let collarDeviation = Math.abs(collarSize - roundedCollarSize);


    if (bmi < 17) {
        bmiFit = "Super Slim";
    } else if (bmi >= 17 && bmi < 18.5) {
        bmiFit = "Extra Slim";
    } else if (bmi >= 18.5 && bmi < 30) {
        bmiFit = "Slim";
    } else {
        bmiFit = "Classic";
    }

    let mlFit = fitValue; // assume fitValues is already defined based on machine learning model

    const collarThreshold = 0.5; // this can be adjusted based on your own data and customer feedback
    console.log(`mlFit- ${mlFit}`)
    console.log(`bmiFit- ${bmiFit}`)
    console.log(`collarDeviation- ${collarDeviation}`)
    console.log(`collarSize- ${collarSize}`)


    // Compare the fits first
    if (mlFit != bmiFit) {
        recommendation =
            "We recommend the " +
            mlFit +
            " fit, but for a different feel you might want to try the " +
            bmiFit +
            " fit.";
    }
    // If no fit recommendation was made, check collar size
    else if (collarDeviation > collarThreshold) {
        recommendation = "You might want a bigger collar size.";
    }
}

// Reset Form
function resetSizeMeasurementModal() {
    formContainer.classList.remove("hidden");
    resultContainer.classList.add("hidden");
    document.querySelector(".measurement-modal-submit").disabled = false;
    sizeMeasurementForm.reset();
}

// Calculate Result and Render it
sizeMeasurementForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const heightFeet = parseFloat(document.getElementById("heightFeet").value);
    const heightInches = parseFloat(
        document.getElementById("heightInches").value
    );
    const weight = parseFloat(document.getElementById("weight").value);
    const age = parseFloat(document.getElementById("age").value);
    const waist = parseFloat(document.getElementById("waist").value);

    calculateCollarSize(heightFeet, heightInches, weight, age, waist);
    calculateBMIFit(heightFeet, heightInches, weight, age, waist);

    const result = `${roundedCollarSize} ${fitValue}`;

    formContainer.classList.add("hidden");
    loadingContainer.classList.remove("hidden");
    document.querySelector(".measurement-modal-submit").disabled = true;

    setTimeout(function () {
        loadingContainer.classList.add("hidden");
        resultContainer.classList.remove("hidden");
        document.querySelector(".measurement-modal-result").textContent =
            result;
        document.querySelector(
            ".measurement-modal-recommendation"
        ).textContent = recommendation;
        document
            .querySelector(".measurement-modal-restart")
            .addEventListener("click", resetSizeMeasurementModal);
    }, 3000);
});

// Close Modal
document
    .querySelector(".measurement-modal-close")
    .addEventListener("click", () => {
        measurementModal.classList.add("hidden");
        resetSizeMeasurementModal();
    });
