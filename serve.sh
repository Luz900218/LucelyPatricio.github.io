#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
powershell.exe -ExecutionPolicy Bypass -File "$SCRIPT_DIR/server.ps1"
