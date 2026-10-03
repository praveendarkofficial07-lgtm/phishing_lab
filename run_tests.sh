#!/bin/bash
echo "Executing automated test suite for AI-Powered Phishing Investigation Lab..."
export PYTHONPATH=.
./venv/bin/pytest backend/app/tests/test_backend.py -v
