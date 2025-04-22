package utils

import (
	"fmt"
	"os"
	"path/filepath"
)

func GetPossiblePaths(relPath string) []string {
	// Get the working directory
	wd, err := os.Getwd()
	if err != nil {
		panic(fmt.Errorf("failed to get working directory: %w", err))
	}

	// Get the application directory
	// Assuming the application directory is the directory containing the executable
	appDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(fmt.Errorf("failed to get application directory: %w", err))
	}

	// List of possible paths: relative path, working directory path, and application directory path
	candidates := []string{
		filepath.Join(wd, relPath),
		filepath.Join(appDir, relPath),
	}

	var validPaths []string
	for _, path := range candidates {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			validPaths = append(validPaths, path)
		}
	}

	return validPaths
}
