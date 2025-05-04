package di

import (
	"fmt"
	"reflect"

	"go.uber.org/dig"
)

type Container struct {
	inner *dig.Container
}

func New() *Container {
	return &Container{
		inner: dig.New(),
	}
}

// Register registers and verifies a constructor without a key
func (container *Container) Register(constructor any) error {
	if err := container.inner.Provide(constructor); err != nil {
		return fmt.Errorf("failed to register constructor: %w", err)
	}

	return container.verifyConstructor(constructor, "")
}

// RegisterWithKey registers and verifies a constructor with a key
func (container *Container) RegisterWithKey(key string, constructor any) error {
	if err := container.inner.Provide(constructor, dig.Name(key)); err != nil {
		return fmt.Errorf("failed to register constructor: %w", err)
	}

	return container.verifyConstructor(constructor, key)
}

// verifyConstructor checks if the constructor can be invoked
func (container *Container) verifyConstructor(constructor any, key string) error {
	constructorType := reflect.TypeOf(constructor)
	if constructorType.Kind() != reflect.Func {
		return fmt.Errorf("constructor must be a function")
	}

	if constructorType.NumOut() != 1 {
		return fmt.Errorf("constructor must return exactly one value")
	}

	returnType := constructorType.Out(0)

	// Create a parameter struct with optional name tag
	paramFields := []reflect.StructField{{
		Name:      "In",
		Type:      reflect.TypeOf(dig.In{}),
		Anonymous: true,
	}}
	serviceField := reflect.StructField{
		Name: "Service",
		Type: returnType,
	}
	if key != "" {
		serviceField.Tag = reflect.StructTag(fmt.Sprintf(`name:"%v"`, key))
	}
	paramFields = append(paramFields, serviceField)

	paramStruct := reflect.StructOf(paramFields)
	consumerType := reflect.FuncOf([]reflect.Type{paramStruct}, nil, false)

	// Create a dummy consumer
	consumer := reflect.MakeFunc(consumerType, func(args []reflect.Value) []reflect.Value {
		return nil
	})

	if err := container.inner.Invoke(consumer.Interface()); err != nil {
		return fmt.Errorf("verification failed: %w", err)
	}
	return nil
}

// Get retrieves a service by type without a key
func Get[T any](c *Container) (T, error) {
	var service T
	err := c.inner.Invoke(func(s T) {
		service = s
	})
	return service, err
}

// GetWithKey retrieves a service by type and key
func GetWithKey[T any](c *Container, key string) (T, error) {
	var result T

	// Dynamically create parameter struct with name tag
	paramStruct := reflect.StructOf([]reflect.StructField{
		{
			Name:      "In",
			Type:      reflect.TypeOf(dig.In{}),
			Anonymous: true,
		},
		{
			Name: "Service",
			Type: reflect.TypeOf(result),
			Tag:  reflect.StructTag(fmt.Sprintf(`name:"%v"`, key)),
		},
	})

	// Create function to extract the service
	fnType := reflect.FuncOf([]reflect.Type{paramStruct}, nil, false)
	fn := reflect.MakeFunc(fnType, func(args []reflect.Value) []reflect.Value {
		result = args[0].Field(1).Interface().(T)
		return nil
	})

	if err := c.inner.Invoke(fn.Interface()); err != nil {
		return result, err
	}
	return result, nil
}

// MustGet retrieves a service without a key, panicking on error
func MustGet[T any](c *Container) T {
	service, err := Get[T](c)
	if err != nil {
		panic(fmt.Errorf("failed to get service: %w", err))
	}
	return service
}

// MustGetWithKey retrieves a service by key, panicking on error
func MustGetWithKey[T any](c *Container, key string) T {
	service, err := GetWithKey[T](c, key)
	if err != nil {
		panic(fmt.Errorf("failed to get service with key '%v': %w", key, err))
	}
	return service
}
