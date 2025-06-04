package utils

import (
	"fmt"
	"regexp"
	"strings"
)

// ExistenceChecker is a function type for checking if a short name exists
type ExistenceChecker func(string) bool

func GenerateSlug(names []string, existsFn ...ExistenceChecker) string {
	var combinedParts []string
	for _, name := range names {
		if name != "" {
			combinedParts = append(combinedParts, name)
		}
	}

	baseName := ""
	if len(combinedParts) > 0 {
		baseName = strings.Join(combinedParts, " ")
	}

	validCharsRegex := regexp.MustCompile(`[^a-zA-Z0-9\- ]+`)
	spaceToHyphenRegex := regexp.MustCompile(`[ \/_]+`)

	count := 1

	var exists ExistenceChecker
	if len(existsFn) > 0 && existsFn[0] != nil {
		exists = existsFn[0]
	}
	var slug string

	for {
		var nameWithCount string
		if count == 1 {
			nameWithCount = baseName
		} else {
			nameWithCount = fmt.Sprintf("%v %d", baseName, count)
		}

		cleaned := validCharsRegex.ReplaceAllString(nameWithCount, "")
		slug = spaceToHyphenRegex.ReplaceAllString(cleaned, "-")
		slug = regexp.MustCompile(`-+`).ReplaceAllString(slug, "-")
		slug = strings.ToLower(strings.Trim(slug, "-"))

		if exists == nil || !exists(slug) {
			break
		}

		count++
	}

	return slug
}
