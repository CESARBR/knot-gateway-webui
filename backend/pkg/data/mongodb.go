package data

import (
	"context"
	"fmt"

	"github.com/CESARBR/knot-gateway-webui/backend/pkg/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDB represents the Mongo database capabilities
type MongoDB struct {
	Hostname string
	Port     int
	Name     string
	client   *mongo.Database
	logger   logging.Logger
}

// NewMongoDB creates a new MongoDB instance
func NewMongoDB(hostname string, port int, name string, logger logging.Logger) *MongoDB {
	return &MongoDB{Hostname: hostname, Port: port, Name: name, client: nil, logger: logger}
}

// Start initiates the MongoDB connection
func (m *MongoDB) Start() {
	ctx := context.Background()
	client, err := mongo.Connect(
		ctx,
		options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:%d/", m.Hostname, m.Port)),
	)
	if err != nil {
		m.logger.Error("Can't connect to MongoDB")
		return
	}
	m.client = client.Database(m.Name)
}

// UpdateOne find one document and update it on MongoDB
func (m *MongoDB) UpdateOne(data interface{}) (interface{}, error) {
	col := m.client.Collection("state")
	update := bson.M{"$set": data}
	return col.UpdateOne(context.TODO(), bson.D{}, update, options.Update().SetUpsert(true))
}

// FindOne find one document based on filter/query
func (m *MongoDB) FindOne(result interface{}) error {
	col := m.client.Collection("state")
	err := col.FindOne(context.TODO(), bson.D{}).Decode(result)
	return err
}
