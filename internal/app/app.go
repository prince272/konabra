package app

import (
	"sync"

	"github.com/gin-gonic/gin"
	"go.uber.org/dig"
)

var (
	container     *dig.Container
	containerOnce sync.Once
)

func getContainer() *dig.Container {
	containerOnce.Do(func() {
		container = dig.New()
	})
	return container
}

func AddService[T any](service T) (T, error) {
	if err := getContainer().Provide(func() T {
		return service
	}); err != nil {
		var zero T
		return zero, err
	}
	return service, nil
}

func GetService[T any]() (T, error) {
	var instance T
	err := getContainer().Invoke(func(dep T) {
		instance = dep
	})
	return instance, err
}

func Init() {
	_, err := AddService(gin.Default())
	if err != nil {
		panic(err)
	}
}

func Run() {
	engine, err := GetService[*gin.Engine]()
	if err != nil {
		panic(err)
	}

	engine.Run()
}
