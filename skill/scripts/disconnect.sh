#!/usr/bin/env bash
# Disconnect this node from the Rent My Browser orchestration server.
# Called when the owner sends a task or the agent exits idle state.

set -euo pipefail

: "${RMB_API_KEY:?RMB_API_KEY is required}"
: "${RMB_SERVER_URL:?RMB_SERVER_URL is required}"

# TODO: Gracefully close WebSocket connection
# TODO: Finish or pause any in-progress rental task
# TODO: Deregister node from the marketplace

echo "rent-my-browser: disconnecting from $RMB_SERVER_URL"
