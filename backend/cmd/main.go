package main

import (
	"github.com/CESARBR/knot-gateway-webui/backend/internal/config"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/server"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
)

func main() {
	config := config.Load()
	logrus := logging.NewLogrus(config.Logger.Level)

	logger := logrus.Get("Main")
	logger.Info("Starting KNoT Gateway WebUI Backend")

	server := server.New(config.Server.Port, logrus.Get("Server"))
	server.Start()
}
