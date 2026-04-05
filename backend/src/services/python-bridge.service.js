const path = require('path');
const { spawn } = require('child_process');
const config = require('../config');

const runPythonSoilCommand = (args = []) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'data', 'model', 'soil', 'backend', 'soil_cli.py');
    const child = spawn('python', [scriptPath, ...args], {
      cwd: path.dirname(scriptPath),
      env: {
        ...process.env,
        TESSERACT_CMD: config.tesseractCmd || process.env.TESSERACT_CMD || ''
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python process failed with code ${code}`));
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid JSON from python bridge: ${stdout || stderr}`));
      }
    });
  });
};

module.exports = {
  runPythonSoilCommand
};
