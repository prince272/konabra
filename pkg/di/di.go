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

func (c *Container) Register(constructor any) error {
	return c.inner.Provide(constructor)
}

func (c *Container) Handle(constructor any) error {
	// Step 1: Register the constructor
	if err := c.inner.Provide(constructor); err != nil {
		return fmt.Errorf("failed to register constructor: %w", err)
	}

	// Step 2: Dynamically invoke the constructor to verify it works
	constructorType := reflect.TypeOf(constructor)
	if constructorType.Kind() != reflect.Func {
		return fmt.Errorf("constructor must be a function")
	}

	// Ensure the constructor returns exactly one value
	if constructorType.NumOut() != 1 {
		return fmt.Errorf("constructor must return exactly one value")
	}

	// Create a function that consumes the constructor's return type
	returnType := constructorType.Out(0)
	consumerFunc := reflect.New(reflect.FuncOf(
		[]reflect.Type{returnType},
		[]reflect.Type{},
		false,
	)).Elem()

	// Set a dummy consumer that does nothing (just verifies construction)
	consumerFunc.Set(reflect.MakeFunc(
		consumerFunc.Type(),
		func(args []reflect.Value) []reflect.Value {
			return nil
		},
	))

	// Invoke the consumer to trigger dependency resolution
	return c.inner.Invoke(consumerFunc.Interface())
}

func Get[T any](c *Container) (T, error) {
	var service T
	err := c.inner.Invoke(func(s T) {
		service = s
	})
	return service, err
}

func MustGet[T any](c *Container) T {
	service, err := Get[T](c)
	if err != nil {
		panic(fmt.Errorf("failed to get service: %w", err))
	}
	return service
}
