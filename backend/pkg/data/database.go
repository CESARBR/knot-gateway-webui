package data

// Database represents the interface with databases
type Database interface {
	UpdateOne(data interface{}) (interface{}, error)
	FindOne(result interface{}) error
}
