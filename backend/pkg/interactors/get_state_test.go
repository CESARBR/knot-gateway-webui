package interactors

import (
	"testing"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/entities"
)

type FakeGetStateRepository struct {
}

type FakeGetStateLogger struct {
}

func (fl *FakeGetStateLogger) Info(...interface{}) {}

func (fl *FakeGetStateLogger) Infof(string, ...interface{}) {}

func (fl *FakeGetStateLogger) Debug(...interface{}) {}

func (fl *FakeGetStateLogger) Warn(...interface{}) {}

func (fl *FakeGetStateLogger) Error(...interface{}) {}

func (fl *FakeGetStateLogger) Errorf(string, ...interface{}) {}

func (fr *FakeGetStateRepository) GetCurrent() (*entities.State, error) {
	state := entities.NewState()
	state.Type = "configuration-user"
	return state, nil
}

func (fr *FakeGetStateRepository) Update(state *entities.State) error {
	return nil
}

func TestGetState(t *testing.T) {
	fakeLogger := &FakeGetStateLogger{}
	fakeRepository := &FakeGetStateRepository{}
	getStateInteractor := NewGetStateInteractor(fakeRepository, fakeLogger)

	_, err := getStateInteractor.Execute() // should return no error
	if err != nil {
		t.Errorf("Get state failed")
		return
	}

	t.Logf("Get state ok")
}
