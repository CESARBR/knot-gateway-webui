package interactors

import (
	"testing"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/entities"
)

type FakeRepository struct {
}

type FakeLogger struct {
}

func (fl *FakeLogger) Info(...interface{}) {}

func (fl *FakeLogger) Infof(string, ...interface{}) {}

func (fl *FakeLogger) Debug(...interface{}) {}

func (fl *FakeLogger) Warn(...interface{}) {}

func (fl *FakeLogger) Error(...interface{}) {}

func (fl *FakeLogger) Errorf(string, ...interface{}) {}

func (fr *FakeRepository) GetCurrent() (*entities.State, error) {
	state := entities.NewState()
	state.Type = "configuration-user"
	return state, nil
}

func (fr *FakeRepository) Update(state *entities.State) error {
	return nil
}

func TestUpdateState(t *testing.T) {
	fakeLogger := &FakeLogger{}
	fakeRepository := &FakeRepository{}
	updateStateInteractor := NewUpdateStateInteractor(fakeRepository, fakeLogger)

	// test for a valid argument
	expectedState := "ready"
	err := updateStateInteractor.Execute(expectedState) // should return no error
	if err != nil {
		t.Errorf("Update state failed: (expected) %s", expectedState)
	} else {
		t.Logf("Update state ok: (expected) %s", expectedState)
	}

	// test for an invalid argument
	expectedState = "undefined"
	err = updateStateInteractor.Execute(expectedState) // should return error
	if err == nil {
		t.Errorf("Update state ok: (expected) %s", expectedState)
	} else {
		t.Logf("Update state failed: (expected) %s", expectedState)
	}
}
