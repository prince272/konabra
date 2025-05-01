package main

import (
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/builds"
)

var api *builds.Api

// @title       Konabra API
// @version     1.0
// @description Konabra is a smart, community-powered transport and road safety platform for Ghana. This API supports live incident reporting, road condition updates, and data analytics integration.
// @host        localhost:8080
// @BasePath    /

func init() {
	// Initialize the application with a new container
	api = builds.NewApi()
}

// ListAllPaths returns a slice of all file and directory paths starting from root
func ListAllPaths(root string) ([]string, error) {
	var paths []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		paths = append(paths, path)
		return nil
	})
	return paths, err
}

func main() {
	// Optional: list all files and directories (for debugging or logging)
	if paths, err := ListAllPaths("."); err == nil {
		fmt.Println("Application Files and Directories:")
		for _, p := range paths {
			fmt.Println(p)
		}
	} else {
		fmt.Println("Error listing files:", err)
	}
}
