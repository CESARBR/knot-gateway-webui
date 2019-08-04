package config

import (
	"os"
	"strings"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"

	"github.com/spf13/viper"
)

// Server represents the server configuration properties
type Server struct {
	Port int
}

// Config represents the service configuration
type Config struct {
	Server
}

func readFile(name string) {
	logger := logging.Get("Config")
	viper.SetConfigName(name)
	if err := viper.ReadInConfig(); err != nil {
		logger.Fatalf("Error reading config file, %s", err)
	}
}

// Load returns the service configuration
func Load() Config {
	var configuration Config
	logger := logging.Get("Config")

	viper.AddConfigPath("internal/config")
	viper.SetConfigType("yaml")

	readFile("default")

	if os.Getenv("ENV") == "development" {
		readFile("development")
		if err := viper.MergeInConfig(); err != nil {
			logger.Fatalf("Error reading config file, %s", err)
		}
	}

	replacer := strings.NewReplacer(".", "_")
	viper.SetEnvKeyReplacer(replacer)
	viper.AutomaticEnv()

	if err := viper.Unmarshal(&configuration); err != nil {
		logger.Fatalf("Error unmarshalling configuration, %s", err)
	}
	return configuration
}
