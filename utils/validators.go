package utils

import (
	"fmt"
	"regexp"
	"unicode/utf8"

	"github.com/go-playground/validator/v10"
	"github.com/gobeam/stringy"
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

// Method to process validation errors and return them in a map
func ProcessValidationErrors(errs validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)
	for _, fieldError := range errs {
		// Generate the error message based on the tag
		var errorMessage string
		switch fieldError.Tag() {
		case "required":
			errorMessage = fmt.Sprintf("%s is required.", fieldError.Field())
		case "email":
			errorMessage = fmt.Sprintf("%s must be a valid email address.", fieldError.Field())
		case "gte":
			errorMessage = fmt.Sprintf("%s must be greater than or equal to %s.", fieldError.Field(), fieldError.Param())
		case "lte":
			errorMessage = fmt.Sprintf("%s must be less than or equal to %s.", fieldError.Field(), fieldError.Param())
		case "password":
			errorMessage = fmt.Sprintf("%s must be 6-256 characters long and include uppercase, lowercase, number, and special character.", fieldError.Field())
		default:
			errorMessage = fmt.Sprintf("%s is not valid.", fieldError.Field())
		}

		errorField := stringy.New(fieldError.Field()).CamelCase().Get()

		// Append the error message to the respective field
		errors[errorField] = errorMessage
	}
	return errors
}
