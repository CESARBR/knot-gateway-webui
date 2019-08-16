package entities

var states = [...]string{
	"rebooting",
	"factory-reset",
	"configuration-cloud",
	"configuration-cloud-security",
	"configuration-user",
	"configuration-gateway",
	"ready",
}

// State represents the application configuration status
type State struct {
	Type string
}

// StateValidationError represents a custom state validation error
type StateValidationError struct{}

// NewStateValidationError creates a new StateValidationError instance
func NewStateValidationError() *StateValidationError {
	return &StateValidationError{}
}

func (err *StateValidationError) Error() string {
	return "State isn't valid"
}

// NewState creates a new State instance
func NewState() *State {
	return &State{}
}

func isValidState(t string) bool {
	for _, a := range states {
		if a == t {
			return true
		}
	}
	return false
}

// Update updates the state type value
func (state *State) Update(t string) error {
	if !isValidState(t) {
		return NewStateValidationError()
	}
	state.Type = t
	return nil
}
