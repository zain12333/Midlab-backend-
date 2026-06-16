import { callOpenAI, SYSTEM_PROMPTS } from "../services/openaiService.js";

// ─── Input sanitizer ─────────────────────────────────────────────────────────

const sanitizeInput = (value) => {
  if (typeof value === "string") {
    return value.replace(/[<>]/g, "").trim().slice(0, 500);
  }
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.map(sanitizeInput);
  if (typeof value === "object" && value !== null) {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      clean[sanitizeInput(k)] = sanitizeInput(v);
    }
    return clean;
  }
  return value;
};

// ─── Generic handler factory ──────────────────────────────────────────────────

const createPredictHandler = (promptKey, buildUserMessage) => async (req, res) => {
  try {
    const rawData = req.body.data !== undefined ? req.body.data : req.body;

    // Reject if nothing was sent
    const isEmpty =
      rawData === undefined ||
      rawData === null ||
      rawData === "" ||
      (typeof rawData === "object" && !Array.isArray(rawData) && Object.keys(rawData).length === 0);

    if (isEmpty) {
      return res.status(400).json({
        success: false,
        message: "No input data provided.",
      });
    }

    const data = sanitizeInput(rawData);
    const userMessage = buildUserMessage(data);

    const result = await callOpenAI(SYSTEM_PROMPTS[promptKey], userMessage);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(`[${promptKey}] Prediction error:`, error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Prediction failed. Please try again.",
    });
  }
};

// ─── Symptom checker ─────────────────────────────────────────────────────────

export const predictSymptoms = createPredictHandler(
  "symptoms",
  (data) => {
    const symptoms = Array.isArray(data)
      ? data
      : typeof data === "string"
      ? data.split(",").map((s) => s.trim())
      : typeof data === "object" && data.data
      ? Array.isArray(data.data)
        ? data.data
        : String(data.data).split(",").map((s) => s.trim())
      : [];

    if (symptoms.length === 0) {
      throw new Error("Please provide at least one symptom.");
    }

    return `Patient symptoms: ${symptoms.join(", ")}. Please analyze these symptoms and provide a structured medical assessment.`;
  }
);

// ─── Diabetes ─────────────────────────────────────────────────────────────────

export const predictDiabetes = createPredictHandler(
  "diabetes",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const entries = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient health metrics for diabetes assessment: ${entries}. Analyze the risk of diabetes based on these values.`;
  }
);

// ─── Heart disease ────────────────────────────────────────────────────────────

export const predictHeart = createPredictHandler(
  "heart",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const entries = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient cardiac health metrics: ${entries}. Analyze the risk of heart disease based on these values.`;
  }
);

// ─── Kidney disease ───────────────────────────────────────────────────────────

export const predictKidney = createPredictHandler(
  "kidney",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const entries = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient kidney health metrics: ${entries}. Analyze the risk of kidney disease based on these values.`;
  }
);

// ─── Liver disease ────────────────────────────────────────────────────────────

export const predictLiver = createPredictHandler(
  "liver",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const entries = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient liver health metrics: ${entries}. Analyze the risk of liver disease based on these values.`;
  }
);

// ─── Breast cancer ────────────────────────────────────────────────────────────

export const predictBreastCancer = createPredictHandler(
  "breastCancer",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const entries = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient breast tissue diagnostic measurements: ${entries}. Assess the risk of breast cancer based on these values.`;
  }
);

// ─── Malaria ──────────────────────────────────────────────────────────────────

export const predictMalaria = createPredictHandler(
  "malaria",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const symptoms = fields.symptoms || fields.data || "No symptoms provided";
    const extra = Object.entries(fields)
      .filter(([k]) => k !== "symptoms" && k !== "data")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient information for malaria assessment. Symptoms: ${symptoms}.${extra ? " Additional info: " + extra : ""} Analyze the likelihood of malaria.`;
  }
);

// ─── Pneumonia ────────────────────────────────────────────────────────────────

export const predictPneumonia = createPredictHandler(
  "pneumonia",
  (data) => {
    const fields = typeof data === "object" ? data : {};
    const symptoms = fields.symptoms || fields.data || "No symptoms provided";
    const extra = Object.entries(fields)
      .filter(([k]) => k !== "symptoms" && k !== "data")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Patient information for pneumonia assessment. Symptoms: ${symptoms}.${extra ? " Additional info: " + extra : ""} Analyze the likelihood of pneumonia.`;
  }
);
