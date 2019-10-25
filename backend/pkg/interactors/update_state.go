package interactors

import (
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/data"
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
)

// UpdateStateInteractor represents the update state use case
type UpdateStateInteractor struct {
	stateRepository data.Repository
	logger          logging.Logger
}

// NewUpdateStateInteractor creates a new UpdateStateInteractor instance
func NewUpdateStateInteractor(stateRepository data.Repository, logger logging.Logger) *UpdateStateInteractor {
	return &UpdateStateInteractor{stateRepository: stateRepository, logger: logger}
}

// Execute runs the use case logic
func (i *UpdateStateInteractor) Execute(t string) error {
	var err error

	state, err := i.stateRepository.GetCurrent()
	if err != nil {
		i.logger.Errorf("Can't receive the current state")
		return err
	}

	err = state.Update(t)
	if err != nil {
		i.logger.Errorf("Invalid state: %s", t)
		return err
	}

	err = i.stateRepository.Update(state)
	if err != nil {
		i.logger.Error("Failed to update state in the repository")
		return err
	}

	i.logger.Info("State updated")
	return nil
}
