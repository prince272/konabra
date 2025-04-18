package app

import "github.com/gin-gonic/gin"

func MapHandlers() {
	router, err := GetService[*gin.Engine]()
	if err != nil {
		panic(err)
	}

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
}
