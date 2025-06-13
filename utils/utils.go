package utils

import (
	"crypto/rand"
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

// CharType defines the allowed character sets for the generated code.
type CharType int

const (
	AlphabeticUniqueCode   CharType = iota // A-Z
	AlphanumericUniqueCode                 // A-Z, 0-9
	NumericUniqueCode                      // 0-9
)

// getCharset returns the character set based on the specified CharType.
func getCharset(charType CharType) string {
	switch charType {
	case AlphabeticUniqueCode:
		return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	case AlphanumericUniqueCode:
		return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	case NumericUniqueCode:
		return "0123456789"
	default:
		panic("invalid CharType specified")
	}
}

// GenerateUniqueCode creates a random uppercase code with the specified prefix, random length, character type, and suffix.
// Parameters:
// - prefix: String to prepend to the generated code
// - chipLength: Length of the random portion to generate
// - charType: Type of characters to use for the random portion (Alphabetic, Alphanumeric, or Numeric)
// - suffix: String to append to the generated code
// - existsFn: Optional function to check if the generated code already exists
// It panics if chipLength is negative.
func GenerateUniqueCode(prefix string, chipLength int, charType CharType, suffix string, existsFn ...ExistenceChecker) string {
	// Validate input parameters
	if chipLength < 0 {
		panic("chipLength must be non-negative")
	}

	// Get the character set for random generation
	charset := func() string {
		switch charType {
		case AlphabeticUniqueCode:
			return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		case AlphanumericUniqueCode:
			return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		case NumericUniqueCode:
			return "0123456789"
		default:
			panic("invalid CharType specified")
		}
	}()

	// Set up existence checker if provided
	var exists ExistenceChecker
	if len(existsFn) > 0 && existsFn[0] != nil {
		exists = existsFn[0]
	}

	// Generate code until unique or no existence checker provided
	for {
		// Generate random portion
		buf := make([]byte, chipLength)
		for i := range buf {
			b := make([]byte, 1)
			if _, err := rand.Read(b); err != nil {
				panic(fmt.Sprintf("failed to generate random byte: %v", err))
			}
			buf[i] = charset[int(b[0])%len(charset)]
		}
		randomPart := string(buf)

		// Construct full code
		code := prefix + randomPart + suffix

		// Check uniqueness (case-insensitive)
		if exists == nil || !exists(strings.ToLower(code)) {
			return code
		}
	}
}
