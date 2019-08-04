package logging

import (
	"os"

	"github.com/sirupsen/logrus"
)

// Get returns a logger entry
func Get(context string) *logrus.Entry {
	log := logrus.New()
	log.Out = os.Stderr
	log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
	})

	logger := log.WithFields(logrus.Fields{
		"Context": context,
	})

	return logger
}
