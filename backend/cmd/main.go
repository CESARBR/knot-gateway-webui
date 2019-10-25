package main

import (
	"github.com/CESARBR/knot-gateway-webui/backend/internal/config"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/controller"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/data"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/interactors"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/server"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
)

func main() {
	config := config.Load()
	logrus := logging.NewLogrus(config.Logger.Level)
	logger := logrus.Get("Main")
	logger.Info("Starting KNoT Gateway WebUI Backend")

	databaseConnection := data.NewMongoDB(
		config.MongoDB.Host,
		config.MongoDB.Port,
		config.MongoDB.Name,
		logrus.Get("MongoDB"),
	)
	stateRepository := data.NewStateRepository(databaseConnection)
	updateStateInteractor := interactors.NewUpdateStateInteractor(
		stateRepository,
		logrus.Get("UpdateStateInteractor"),
	)
	stateController := controller.NewStateController(updateStateInteractor, logrus.Get("StateController"))
	server := server.NewServer(config.Server.Port, stateController, logrus.Get("Server"))

	databaseConnection.Start()
	server.Start()
}
