package logging

// Logger represents the generic logger interface
type Logger interface {
	Info(...interface{})
	Infof(string, ...interface{})
	Debug(...interface{})
	Warn(...interface{})
	Error(...interface{})
	Errorf(string, ...interface{})
}
