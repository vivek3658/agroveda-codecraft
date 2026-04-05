const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const config = require('../config');

const scriptPath = path.resolve(__dirname, '..', '..', 'data', 'model', 'soil', 'backend', 'soil_cli.py');
const scriptDir = path.dirname(scriptPath);
const pythonCandidates = [
  process.env.PYTHON_EXECUTABLE,
  process.platform === 'win32' ? 'python' : 'python3',
  process.platform === 'win32' ? 'py' : 'python'
].filter(Boolean);

const runPythonSoilCommand = (args = []) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Soil model script not found: ${scriptPath}`));
    }

    const attemptSpawn = (candidateIndex) => {
      if (candidateIndex >= pythonCandidates.length) {
        return reject(
          new Error(
            `Python runtime not found. Tried: ${pythonCandidates.join(', ')}. ` +
            'Set PYTHON_EXECUTABLE in the environment if needed.'
          )
        );
      }

      const executable = pythonCandidates[candidateIndex];
      const child = spawn(executable, [scriptPath, ...args], {
        cwd: scriptDir,
        env: {
          ...process.env,
          TESSERACT_CMD: config.tesseractCmd || process.env.TESSERACT_CMD || ''
        }
      });

      let stdout = '';
      let stderr = '';
      let retried = false;

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        if (error.code === 'ENOENT' && !retried) {
          retried = true;
          return attemptSpawn(candidateIndex + 1);
        }

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
    };

    attemptSpawn(0);
  });
};

module.exports = {
  runPythonSoilCommand
};
