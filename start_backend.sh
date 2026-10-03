#!/bin/bash
echo "Starting AI-Powered Phishing Investigation Lab Backend..."
export PYTHONPATH=.
./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
