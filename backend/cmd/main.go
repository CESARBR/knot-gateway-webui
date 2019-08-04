package main

import (
	"github.com/CESARBR/knot-gateway-webui/backend/internal/config"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/server"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
)

func main() {
	logger := logging.Get("Main")
	logger.Info("Starting KNoT Gateway WebUI Backend")

	config := config.Load()

	server := server.New(config.Server.Port)
	server.Start()
}
