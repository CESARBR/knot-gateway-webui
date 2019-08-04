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
	port int
}

// New creates a new server instance
func New(port int) Server {
	return Server{port}
}

// Start starts the http server
func (s *Server) Start() {
	routers := createRouters()
	logger := logging.Get("Server")

	logger.Info(fmt.Sprintf("Listening on %d", s.port))
	err := http.ListenAndServe(fmt.Sprintf(":%d", s.port), logRequest(routers))
	if err != nil {
		logger.Error(err)
	}
}

func createRouters() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/healthcheck", healthcheckHandler)
	return r
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.Get("Server")
		logger.Info(fmt.Sprintf("%s %s %s\n", r.RemoteAddr, r.Method, r.URL))
		handler.ServeHTTP(w, r)
	})
}

func healthcheckHandler(w http.ResponseWriter, r *http.Request) {
	logger := logging.Get("Server")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response, _ := json.Marshal(&Health{Status: "online"})
	_, err := w.Write(response)
	if err != nil {
		logger.Error(fmt.Sprintf("Error sending response, %s\n", err))
	}
}
