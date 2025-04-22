package utils

import (
	"regexp"
	"unicode/utf8"

	"github.com/go-playground/validator/v10"
)

func ValidatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	length := utf8.RuneCountInString(password)

	if length < 6 || length > 256 {
		return false
	}

	upper := regexp.MustCompile(`[A-Z]`)
	lower := regexp.MustCompile(`[a-z]`)
	digit := regexp.MustCompile(`[0-9]`)
	special := regexp.MustCompile(`[^a-zA-Z0-9]`)

	return upper.MatchString(password) &&
		lower.MatchString(password) &&
		digit.MatchString(password) &&
		special.MatchString(password)
}
