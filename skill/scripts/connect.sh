#!/usr/bin/env bash
# Connect this node to the Rent My Browser orchestration server.
# Called by the OpenClaw skill when the agent enters idle state.

set -euo pipefail

: "${RMB_API_KEY:?RMB_API_KEY is required}"
: "${RMB_SERVER_URL:?RMB_SERVER_URL is required}"

# TODO: Detect node type (headless vs real) if RMB_NODE_TYPE is not set
# TODO: Gather node capabilities (browser version, geo, etc.)
# TODO: Open persistent WebSocket to $RMB_SERVER_URL/nodes/connect
# TODO: Advertise capabilities and start accepting tasks

echo "rent-my-browser: connecting to $RMB_SERVER_URL"
