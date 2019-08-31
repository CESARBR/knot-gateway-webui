package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"

	"github.com/gorilla/mux"
)

// Health represents the service's health status
type Health struct {
	Status string `json:"status"`
}

// Server represents the HTTP server
type Server struct {
	port   int
	logger logging.Logger
}

// New creates a new server instance
func New(port int, logger logging.Logger) Server {
	return Server{port, logger}
}

// Start starts the http server
func (s *Server) Start() {
	routers := s.createRouters()
	s.logger.Info(fmt.Sprintf("Listening on %d", s.port))
	err := http.ListenAndServe(fmt.Sprintf(":%d", s.port), s.logRequest(routers))
	if err != nil {
		s.logger.Error(err)
	}
}

func (s *Server) createRouters() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/healthcheck", s.healthcheckHandler)
	return r
}

func (s *Server) logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		s.logger.Info(fmt.Sprintf("%s %s %s\n", r.RemoteAddr, r.Method, r.URL))
		handler.ServeHTTP(w, r)
	})
}

func (s *Server) healthcheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response, _ := json.Marshal(&Health{Status: "online"})
	_, err := w.Write(response)
	if err != nil {
		s.logger.Error(fmt.Sprintf("Error sending response, %s\n", err))
	}
}
