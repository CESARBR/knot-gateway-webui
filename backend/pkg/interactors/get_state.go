package interactors

import (
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/data"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/entities"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
)

// GetStateInteractor represents the get state use case
type GetStateInteractor struct {
	stateRepository data.Repository
	logger          logging.Logger
}

// NewGetStateInteractor creates a new GetStateInteractor instance
func NewGetStateInteractor(stateRepository data.Repository, logger logging.Logger) *GetStateInteractor {
	return &GetStateInteractor{stateRepository: stateRepository, logger: logger}
}

// Execute runs the use case logic
func (i *GetStateInteractor) Execute() (*entities.State, error) {
	state, err := i.stateRepository.GetCurrent()
	if err != nil {
		i.logger.Error("Failed to get the current state")
		return nil, err
	}
	return state, nil
}
