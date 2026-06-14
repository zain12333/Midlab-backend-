import express from "express";
import { spawn } from "child_process";
import path from "path";
import { backendRoot } from "../utils/paths.js";
const router = express.Router({ mergeParams: true });

const getPythonCommand = () => {
  // Full path to Python 3.14 installation
  const fullPath = "C:\\Users\\zaina\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe";
  const candidates = [
    process.env.PYTHON_PATH,
    fullPath,
    process.env.PYTHON,
    process.platform === "win32" ? null : "python3",
    "python",
    process.platform === "win32" ? "py" : null,
  ].filter(Boolean);
  
  return candidates[0] || "python";
};

const pythonScriptPathForSymptoms = path.join(backendRoot, "symptoms.py");
const symptomsModel = path.join(backendRoot, "aimodels", "svc.pkl");

router.post("/symptoms", (req, res) => {
  let responseSent = false; // Flag to track if response has been sent
  try {
    const rawSymptoms = req.body.data;
    const symptoms = Array.isArray(rawSymptoms)
      ? rawSymptoms
      : typeof rawSymptoms === "string"
        ? rawSymptoms.split(",")
        : [];
    const normalizedSymptoms = symptoms
      .map((item) => item.toString().trim().toLowerCase().replace(/\s+/g, "_"))
      .filter(Boolean);

    console.log({ dataInString: JSON.stringify({ data: normalizedSymptoms }) });
    const pythonProcess = spawn(getPythonCommand(), [
      pythonScriptPathForSymptoms,
      "--loads",
      symptomsModel,
      JSON.stringify({ data: normalizedSymptoms }),
    ]);

    let stdoutBuffer = "";
    pythonProcess.stdout.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      const output = stdoutBuffer.trim();
      let prediction;
      if (output) {
        try {
          prediction = JSON.parse(output);
        } catch (error) {
          const lines = output
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
          const jsonLine = [...lines].reverse().find((line) => line.startsWith("{") || line.startsWith("["));
          if (jsonLine) {
            try {
              prediction = JSON.parse(jsonLine);
            } catch (parseError) {
              console.error("Failed to parse Python output:", parseError);
            }
          }
        }
      }

      if (!responseSent) {
        if (prediction) {
          res.json({ data: prediction });
        } else {
          res.status(500).send("Invalid prediction output");
        }
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      responseSent = true;
      return res.status(500).send("Internal Server Error");
    }
  }
});

export default router;
