package data

import (
	"github.com/CESARBR/knot-gateway-webui/backend/pkg/entities"
)

// StateSchema represents the state schema
type StateSchema struct {
	Type string `bson:"type"`
}

// Repository represents the state repository interface
type Repository interface {
	GetCurrent() (*entities.State, error)
	Update(state *entities.State) error
}

// StateRepository represents the state repository
type StateRepository struct {
	database Database
}

// NewStateRepository creates a new StateRepository instance
func NewStateRepository(database Database) *StateRepository {
	return &StateRepository{database}
}

// GetCurrent returns the current state
func (sp *StateRepository) GetCurrent() (*entities.State, error) {
	state := entities.NewState()
	err := sp.database.FindOne(state)
	if err != nil {
		return nil, err
	}

	return state, nil
}

// Update updates the state on database
func (sp *StateRepository) Update(state *entities.State) error {
	newState := &StateSchema{state.Type}
	_, err := sp.database.UpdateOne(newState)
	return err
}
