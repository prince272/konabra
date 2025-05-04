package helpers

import (
	"fmt"
	"regexp"
	"unicode/utf8"

	"github.com/go-playground/validator/v10"
	"github.com/gobeam/stringy"
	"github.com/nyaruka/phonenumbers"
)

type ValidationHelper struct {
	validate *validator.Validate
}

func NewValidationHelper() *ValidationHelper {
	validate := validator.New()
	if err := validate.RegisterValidation("username", ValidateUsername); err != nil {
		panic(fmt.Errorf("failed to register username validator: %w", err))
	}

	if err := validate.RegisterValidation("password", ValidatePassword); err != nil {
		panic(fmt.Errorf("failed to register password validator: %w", err))
	}
	return &ValidationHelper{
		validate: validate,
	}
}

func (helper *ValidationHelper) ValidateStruct(s any) error {
	return helper.validate.Struct(s)
}

// ValidatePassword checks password strength
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

// ValidateUsername determines whether input is a valid phone or email
func ValidateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	return IsPhoneNumber(username) || IsEmail(username)
}

// Helper: Check if input is phone number using phonenumbers lib
func IsPhoneNumber(input string) bool {
	num, err := phonenumbers.Parse(input, "") // Adjust default region as needed
	if err != nil {
		return false
	}
	return phonenumbers.IsValidNumber(num)
}

// Helper: Check if input is email
func IsEmail(input string) bool {
	emailPattern := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailPattern.MatchString(input)
}

func maybePhoneNumber(input string) bool {
	phonePattern := regexp.MustCompile(`^[-+0-9() ]+$`)
	return phonePattern.MatchString(input)
}

// ProcessValidationErrors builds user-friendly error messages
func GetProcessValidationErrors(errs validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)
	for _, fieldError := range errs {
		var errorMessage string
		fieldValue := fieldError.Value().(string)

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
		case "username":
			if maybePhoneNumber(fieldValue) {
				errorMessage = fmt.Sprintf("%s must be a valid phone number.", fieldError.Field())
			} else {
				errorMessage = fmt.Sprintf("%s must be a valid email address.", fieldError.Field())
			}
		default:
			errorMessage = fmt.Sprintf("%s is not valid.", fieldError.Field())
		}

		errorField := stringy.New(fieldError.Field()).CamelCase().Get()
		errors[errorField] = errorMessage
	}
	return errors
}
